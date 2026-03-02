interface SubmitButtonProps {
  disabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function SubmitButton({
  disabled,
  isSubmitting,
  onSubmit
}: SubmitButtonProps) {
  return (
    <button
      className="submit-button"
      type="button"
      disabled={disabled}
      onClick={onSubmit}
    >
      {isSubmitting ? "SUBMITTING..." : "SUBMIT VOTE"}
    </button>
  );
}
