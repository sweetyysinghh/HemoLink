import { Link } from "react-router-dom";
import styles from "./Button.module.css";

function Button({ to, variant = "primary", className = "", children, ...props }) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  if (to) {
    return <Link className={classes} to={to} {...props}>{children}</Link>;
  }

  return <button className={classes} {...props}>{children}</button>;
}

export default Button;