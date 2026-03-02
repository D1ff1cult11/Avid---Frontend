interface SuccessReceiptProps {
  receiptHash: string | null;
}

export default function SuccessReceipt({ receiptHash }: SuccessReceiptProps) {
  if (!receiptHash) {
    return null;
  }

  return (
    <section className="card success-receipt">
      <p className="success-title">Vote submitted successfully</p>
      <p className="receipt-text">
        Receipt hash:
        <span className="receipt-hash">{receiptHash}</span>
      </p>
    </section>
  );
}
