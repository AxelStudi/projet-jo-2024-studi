
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mfa-secret',
}

// Base32 encoding/decoding functions
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(buffer: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8
    
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31]
  }
  
  return output
}

function base32Decode(encoded: string): Uint8Array {
  const cleanInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const buffer = new Uint8Array(Math.floor(cleanInput.length * 5 / 8))
  let bits = 0
  let value = 0
  let index = 0
  
  for (const char of cleanInput) {
    const charValue = BASE32_CHARS.indexOf(char)
    if (charValue === -1) continue
    
    value = (value << 5) | charValue
    bits += 5
    
    if (bits >= 8) {
      buffer[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }
  
  return buffer.slice(0, index)
}

// TOTP generation function
async function generateTOTP(secret: string, timeStep: number): Promise<string> {
  try {
    const secretBytes = base32Decode(secret)
    
    // Create time buffer (8 bytes, big-endian)
    const timeBuffer = new ArrayBuffer(8)
    const timeView = new DataView(timeBuffer)
    timeView.setUint32(4, timeStep, false) // Big-endian
    
    // Import key for HMAC-SHA1
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    )
    
    // Generate HMAC
    const signature = await crypto.subtle.sign('HMAC', key, timeBuffer)
    const hmac = new Uint8Array(signature)
    
    // Dynamic truncation
    const offset = hmac[19] & 0xf
    const code = (
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)
    ) % 1000000
    
    return code.toString().padStart(6, '0')
  } catch (error) {
    console.error('TOTP generation error:', error)
    throw error
  }
}

// Verify TOTP with time window tolerance
async function verifyTOTP(secret: string, token: string): Promise<boolean> {
  const currentTimeStep = Math.floor(Date.now() / 1000 / 30)
  
  // Check current time window and ±1 for clock drift
  for (let i = -1; i <= 1; i++) {
    try {
      const testCode = await generateTOTP(secret, currentTimeStep + i)
      if (testCode === token) {
        return true
      }
    } catch (error) {
      console.error(`TOTP verification error for window ${i}:`, error)
    }
  }
  
  return false
}

serve(async (req) => {
  console.log('MFA setup request received:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header found')
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !userData.user) {
      console.error('User authentication failed:', userError)
      throw new Error('Invalid token')
    }

    console.log('User authenticated:', userData.user.id)

    const { action, token: mfaToken } = await req.json()
    console.log('MFA action requested:', action)

    switch (action) {
      case 'setup': {
        try {
          console.log('Starting MFA setup...')
          
          // Generate random secret (20 bytes)
          const secretBytes = new Uint8Array(20)
          crypto.getRandomValues(secretBytes)
          const secret = base32Encode(secretBytes)
          
          console.log('Secret generated successfully')

          // Create OTP Auth URL
          const issuer = encodeURIComponent('Paris 2024 Tickets')
          const accountName = encodeURIComponent(userData.user.email || 'user')
          const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`

          console.log('OTP Auth URL created')

          // Generate QR code using external service (more reliable than libraries)
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
          
          console.log('QR code URL generated')

          return new Response(
            JSON.stringify({
              success: true,
              secret: secret,
              qrCodeUrl: qrUrl,
              otpauthUrl: otpauthUrl
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (error) {
          console.error('Setup error:', error)
          throw error
        }
      }

      case 'enable': {
        try {
          console.log('Starting MFA enable...')
          
          if (!mfaToken || mfaToken.length !== 6) {
            console.error('Invalid MFA token provided')
            return new Response(
              JSON.stringify({ success: false, error: 'Code invalide' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              }
            )
          }

          // Get user's temporary secret from request header
          const tempSecret = req.headers.get('X-MFA-Secret')
          if (!tempSecret) {
            console.error('No temporary MFA secret found in headers')
            return new Response(
              JSON.stringify({ success: false, error: 'Session MFA expirée' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              }
            )
          }

          console.log('Verifying TOTP token...')
          const verified = await verifyTOTP(tempSecret, mfaToken)

          if (!verified) {
            console.error('TOTP verification failed')
            return new Response(
              JSON.stringify({ success: false, error: 'Code invalide' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              }
            )
          }

          console.log('TOTP verified, updating user record...')

          // Store the secret and enable MFA
          const { error: updateError } = await supabaseClient
            .from('users')
            .update({
              mfa_secret: tempSecret,
              mfa_enabled: true
            })
            .eq('id', userData.user.id)

          if (updateError) {
            console.error('Database update error:', updateError)
            throw updateError
          }

          console.log('MFA enabled successfully for user:', userData.user.id)

          return new Response(
            JSON.stringify({ success: true }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (error) {
          console.error('Enable error:', error)
          throw error
        }
      }

      case 'verify':
      case 'disable': {
        try {
          console.log(`Starting MFA ${action}...`)
          
          if (!mfaToken || mfaToken.length !== 6) {
            console.error('Invalid MFA token provided')
            return new Response(
              JSON.stringify({ success: false, error: 'Code invalide' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              }
            )
          }

          // Get user's MFA secret
          const { data: userProfile, error: profileError } = await supabaseClient
            .from('users')
            .select('mfa_secret, mfa_enabled')
            .eq('id', userData.user.id)
            .single()

          if (profileError || !userProfile || !userProfile.mfa_enabled || !userProfile.mfa_secret) {
            console.error('User MFA not properly configured:', profileError)
            return new Response(
              JSON.stringify({ success: false, error: 'MFA non configurée' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              }
            )
          }

          console.log('Verifying stored TOTP token...')
          const verified = await verifyTOTP(userProfile.mfa_secret, mfaToken)

          if (!verified) {
            console.error('TOTP verification failed')
            return new Response(
              JSON.stringify({ success: false, error: 'Code invalide' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              }
            )
          }

          if (action === 'disable') {
            console.log('Disabling MFA...')
            // Disable MFA
            const { error: updateError } = await supabaseClient
              .from('users')
              .update({
                mfa_secret: null,
                mfa_enabled: false
              })
              .eq('id', userData.user.id)

            if (updateError) {
              console.error('Database update error:', updateError)
              throw updateError
            }

            console.log('MFA disabled successfully for user:', userData.user.id)
          }

          return new Response(
            JSON.stringify({ success: true }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (error) {
          console.error(`${action} error:`, error)
          throw error
        }
      }

      default:
        console.error('Unsupported action:', action)
        return new Response(
          JSON.stringify({ success: false, error: 'Action non supportée' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
    }
  } catch (error) {
    console.error('MFA setup error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur serveur',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
