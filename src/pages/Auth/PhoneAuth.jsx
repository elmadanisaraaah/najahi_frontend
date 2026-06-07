import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, ArrowRight, KeyRound } from "lucide-react";
import AuthLayout from "./AuthLayout";
import styles from "./Auth.module.css";

export default function PhoneAuth() {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setMessage("Verification code sent successfully.");
    }, 800);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    setTimeout(() => {
      setLoading(false);
      setMessage("Phone verification completed.");
    }, 800);
  };

  return (
    <AuthLayout
      title="Phone verification"
      subtitle="Continue with your phone number and confirm the OTP code."
    >
      {message ? <div className={styles.success}>{message}</div> : null}

      {step === "phone" ? (
        <form className={styles.form} onSubmit={handlePhoneSubmit}>
          <div className={styles.field}>
            <label htmlFor="phone">Phone number</label>
            <div className={styles.inputWrap}>
              <Phone size={18} />
              <input
                id="phone"
                type="tel"
                placeholder="+212 6 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            <span>{loading ? "Sending..." : "Send code"}</span>
            <ArrowRight size={18} />
          </button>

          <p className={styles.footerText}>
            Back to <Link to="/login">sign in</Link>
          </p>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleOtpSubmit}>
          <div className={styles.field}>
            <label htmlFor="otp">Verification code</label>
            <div className={styles.inputWrap}>
              <KeyRound size={18} />
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            <span>{loading ? "Verifying..." : "Verify code"}</span>
            <ArrowRight size={18} />
          </button>

          <p className={styles.footerText}>
            Didn&apos;t receive it? <Link to="/phone-auth">Resend</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}