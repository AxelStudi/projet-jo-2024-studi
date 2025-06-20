import React from 'react';
import QRCode from 'qrcode.react';

interface QRCodeTicketProps {
  ticketId: string;
  eventName: string;
  date: string;
  userName: string;
  offerType: string;
  attendees: number;
  qrValue: string;
}

const QRCodeTicket: React.FC<QRCodeTicketProps> = ({
  ticketId,
  eventName,
  date,
  userName,
  offerType,
  attendees,
  qrValue
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary-blue text-white px-6 py-4">
        <h3 className="text-xl font-bold">Billet Officiel</h3>
        <p className="text-sm opacity-90">Paris 2024 - Jeux Olympiques</p>
      </div>
      
      {/* QR Code */}
      <div className="flex justify-center p-6 bg-gray-50">
        <QRCode 
          value={qrValue}
          size={180}
          level="H"
          includeMargin={true}
          renderAs="svg"
        />
      </div>
      
      {/* Ticket Info */}
      <div className="px-6 py-4">
        <div className="flex justify-between border-b border-gray-200 py-2">
          <span className="text-gray-600">Événement:</span>
          <span className="text-gray-900 font-medium">{eventName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 py-2">
          <span className="text-gray-600">Date:</span>
          <span className="text-gray-900 font-medium">{date}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 py-2">
          <span className="text-gray-600">Détenteur:</span>
          <span className="text-gray-900 font-medium">{userName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 py-2">
          <span className="text-gray-600">Type:</span>
          <span className={`badge ${
            offerType === 'solo' ? 'badge-blue' : 
            offerType === 'duo' ? 'badge-red' : 'badge-gold'
          } capitalize`}>
            {offerType}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Personnes:</span>
          <span className="text-gray-900 font-medium">{attendees}</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 text-center">
        <p>ID: {ticketId}</p>
        <p className="mt-1">Ce billet est nominatif et ne peut être transféré</p>
      </div>
    </div>
  );
};

export default QRCodeTicket;