import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button/Button";
import useAuth from "../../context/useAuth";
import { accountRoles, bloodTypes } from "../../data/authData";
import styles from "./AuthPage.module.css";

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, requestPasswordReset, resetPassword } = useAuth();
  const [accountType, setAccountType] = useState("donor");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const resetToken = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    const values = new FormData(event.currentTarget);

    try {
      if (mode === "forgot") {
        await requestPasswordReset(values.get("email"));
        setSubmitted(true);
        return;
      }
      if (mode === "reset") {
        if (!resetToken) throw new Error("This reset link is missing its token.");
        if (values.get("password") !== values.get("passwordConfirm")) {
          throw new Error("The passwords do not match.");
        }
        await resetPassword(resetToken, values.get("password"));
        setSubmitted(true);
        return;
      }
      if (mode === "register") {
        const user = await register({
          role: accountType.toUpperCase(),
          email: values.get("email"),
          password: values.get("password"),
          fullName: values.get("name") || values.get("contact"),
          phone: values.get("phone"),
          organizationName: values.get("hospital") || null,
          city: values.get("city") || null,
          bloodType: values.get("bloodType")?.replace("−", "-") || null,
        });
        navigate(`/${user.role.toLowerCase()}`, { replace: true });
        return;
      }

      const user = await login({ email: values.get("email"), password: values.get("password") });
      const destination = location.state?.from?.pathname;
      const roleHome = `/${user.role.toLowerCase()}`;
      navigate(destination?.startsWith(roleHome) ? destination : roleHome, { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message || "Unable to complete your request.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "register" ? "Create your account" : mode === "forgot" || mode === "reset" ? "Reset your password" : "Welcome back";
  const subtitle = mode === "register"
    ? "Join a network helping hospitals and donors act sooner."
    : mode === "forgot"
      ? "We’ll send a secure reset link to your email address."
      : mode === "reset"
        ? "Choose a new password for your HemoLink account."
      : "Sign in to continue to your HemoLink workspace.";

  return (
    <main className={styles.authPage}>
      <section className={styles.story} aria-label="HemoLink mission">
        <Link className={styles.brand} to="/"><span>H</span> HemoLink</Link>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>A NETWORK THAT RESPONDS</p>
          <h1>Care moves faster when we move together.</h1>
          <p>Connect with people and care teams making every blood donation count.</p>
        </div>
        <div className={styles.storyNote}><span aria-hidden="true">“</span><p>Every connection is a chance to make a meaningful difference.</p></div>
      </section>
      <section className={styles.formSide}>
        <div className={styles.formWrap}>
          <p className={styles.mobileBrand}><span>H</span> HemoLink</p>
          <p className={styles.eyebrow}>{mode === "register" ? "GET STARTED" : mode === "forgot" || mode === "reset" ? "ACCOUNT RECOVERY" : "YOUR WORKSPACE"}</p>
          <h2>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
          {submitted ? (
            <div className={styles.success} role="status">
              <strong>{mode === "reset" ? "Password updated" : "Check your inbox"}</strong>
              <p>{mode === "reset" ? "Your password has been changed. Sign in with the new password." : "If an account exists for that address, a reset link is on its way."}</p>
              {mode === "reset" && <Link className={styles.backLink} to="/login">Continue to sign in</Link>}
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              {mode === "register" && (
                <fieldset className={styles.roleField}>
                  <legend>I’m joining as a</legend>
                  <div className={styles.roles}>
                    {accountRoles.filter((item) => item.role !== "admin").map((item) => (
                      <button
                        className={`${styles.role} ${accountType === item.role ? styles.roleSelected : ""}`}
                        key={item.role}
                        type="button"
                        aria-pressed={accountType === item.role}
                        onClick={() => setAccountType(item.role)}
                      >
                        <strong>{item.label}</strong><span>{item.description}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {mode === "register" && accountType === "donor" && <label className={styles.field}>Full name<input autoComplete="name" name="name" placeholder="Your full name" required /></label>}
              {mode === "register" && accountType === "hospital" && <label className={styles.field}>Hospital name<input autoComplete="organization" name="hospital" placeholder="Hospital or blood bank" required /></label>}
              {mode === "register" && accountType === "hospital" && <label className={styles.field}>Contact person<input autoComplete="name" name="contact" placeholder="Primary contact name" required /></label>}
              <label className={styles.field}>Email address<input autoComplete="email" name="email" type="email" placeholder="you@example.com" required /></label>
              {mode === "register" && <label className={styles.field}>Phone number<input autoComplete="tel" name="phone" type="tel" placeholder="+91 98765 43210" required /></label>}
              {mode === "register" && accountType === "donor" && (
                <div className={styles.fieldRow}>
                  <label className={styles.field}>Blood type<select name="bloodType" defaultValue="" required><option value="" disabled>Select</option>{bloodTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                  <label className={styles.field}>City<input autoComplete="address-level2" name="city" placeholder="Your city" required /></label>
                </div>
              )}
              {mode === "register" && accountType === "hospital" && <label className={styles.field}>City<input autoComplete="address-level2" name="city" placeholder="Hospital city" required /></label>}
              {mode !== "forgot" && <label className={styles.field}>{mode === "reset" ? "New password" : "Password"}<input autoComplete={mode === "login" ? "current-password" : "new-password"} name="password" type="password" minLength="8" maxLength="72" placeholder="At least 8 characters" required /></label>}
              {mode === "reset" && <label className={styles.field}>Confirm new password<input autoComplete="new-password" name="passwordConfirm" type="password" minLength="8" maxLength="72" placeholder="Re-enter your new password" required /></label>}
              {mode === "login" && <Link className={styles.forgot} to="/forgot-password">Forgot password?</Link>}
              {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
              <Button type="submit" className={styles.submit} disabled={submitting}>{submitting ? "Please wait…" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : mode === "reset" ? "Update password" : "Sign in"}<span aria-hidden="true">↗</span></Button>
            </form>
          )}
          {mode !== "forgot" && mode !== "reset" && <p className={styles.switchMode}>{mode === "register" ? "Already have an account?" : "New to HemoLink?"} <Link to={mode === "register" ? "/login" : "/register"}>{mode === "register" ? "Sign in" : "Create an account"}</Link></p>}
          {mode === "forgot" && <Link className={styles.backLink} to="/login">← Back to sign in</Link>}
        </div>
      </section>
    </main>
  );
}

export default AuthPage;