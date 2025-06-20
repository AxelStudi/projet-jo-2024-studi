
import { useMfaStore } from '../stores/mfaStore';

export const useMfa = () => {
  const {
    isSetupMode,
    qrCodeUrl,
    secret,
    isLoading,
    error,
    setupMfa,
    enableMfa,
    verifyMfa,
    disableMfa,
    reset
  } = useMfaStore();

  return {
    isSetupMode,
    qrCodeUrl,
    secret,
    isLoading,
    error,
    setupMfa,
    enableMfa,
    verifyMfa,
    disableMfa,
    reset
  };
};
