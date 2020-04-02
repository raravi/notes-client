import React from 'react';

/**
 * ForgotPassword React Component: This component
 * contains the Forgot Password 'page'.
 */
export const ForgotPasswordSection = (props) => {
  return (
    <section className="forgot-password">
      <h2 className="forgot-password__header">Forgot Password?</h2>
      <p className="forgot-password__text">Please enter the email address associated with your account.</p>
      <input type="email" name="email" className="forgot-password__email" placeholder="Email" />
      <label className="forgot-password__email-error">{props.forgotPasswordEmailError}</label>
      <label className="forgot-password__email-success">{props.forgotPasswordEmailSuccess}</label><br />
      <button type="button"
              className="forgot-password__submit"
              onClick={props.sendForPasswordReset} data-testid="forgotpassword-button">
        Submit
      </button>
    </section>
  )
}
