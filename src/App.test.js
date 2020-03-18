import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axiosMock from 'axios';
import App from './App';

jest.mock('axios');

const responseLoginSuccess = {
        data: {
          success: true,
          token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNWVkY2E0M2FhOWRjNTg3NTAzZTFiNCIsIm5hbWUiOiJBbWl0aCBSYXJhdmkiLCJpYXQiOjE1ODQ0MDQxNzQsImV4cCI6MTYxNTk2MTEwMH0.qLqhN_1CHbQLOCXzOyxRZS9K42AsoHtQbF-qL8vgn0o',
          notes: []
        }
      },
      responseLoginError = {
        response: {
          status: 404,
          data: {
            email: "Email not found",
            password: "Password incorrect"
          }
        }
      },
      loginURL = 'http://localhost:8000/api/users/login',
      loginOptions = {"email": "", "password": ""},
      responseRegisterSuccess = {
        data: {createduser: "New user registered successfully!"}
      },
      responseRegisterError = {
        response: {
          status: 404,
          data: {
            name: "Name field is required",
            email: "Email already exists",
            password: "Password must be at least 6 characters",
            password2: "Passwords must match"
          }
        }
      },
      registerURL = "http://localhost:8000/api/users/register",
      registerOptions = {"name": "", "email": "", "password": "", "password2": ""},
      responseForgotPasswordSuccess = {
        data: {emailsent: 'The reset email has been sent, please check your inbox!'}
      },
      responseForgotPasswordError = {
        response: {
          status: 404,
          data: { email: "Email not found" }
        }
      },
      forgotPasswordURL = "http://localhost:8000/api/users/forgotpassword",
      forgotPasswordOptions = {"email": ""},
      responseLogoutSuccess = {
        data: {
          success: true
        }
      },
      responseNewNoteSuccess = {
        data: {
          note: {
            id: '1234567890',
            note: '# An awesome new note',
            modifieddate: Date.now(),
            createddate: Date.now()
          }
        }
      };

afterEach(cleanup);

it('should take a snapshot', () => {
  const { asFragment } = render(<App />);
  expect(asFragment(<App />)).toMatchSnapshot();
});

/**
 * LOGIN page
 */
describe('Login Page', () => {
  it('submit button is present', () => {
    const { getByTestId } = render(<App />);

    expect(getByTestId('login-button')).toBeInTheDocument();
  });

  it('login is successful', async () => {
    axiosMock.post.mockResolvedValueOnce(responseLoginSuccess);
    const { getByTestId, findByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-button'));

    const dashboardNoteElement = await findByTestId('dashboard-note');
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it('login error occured', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject(responseLoginError));
    const { getByTestId, findByText } = render(<App />);

    fireEvent.click(getByTestId('login-button'));

    const emailErrorElement = await findByText(responseLoginError.response.data.email);
    const passwordErrorElement = await findByText(responseLoginError.response.data.password);
    expect(axiosMock.post).toHaveBeenCalledTimes(2);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it('Register link is clicked', () => {
    const { getByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-register'));

    expect(getByTestId('register-button')).toBeInTheDocument();
  });

  it('Forgot Password is clicked', () => {
    const { getByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-forgotpassword'));

    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();
  });
});

/**
 * REGISTER page
 */
describe('Register Page', () => {
  it('submit button is present', () => {
    const { getByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-register'));

    expect(getByTestId('register-button')).toBeInTheDocument();
  });

  it('Register is successful', async () => {
    axiosMock.post.mockResolvedValueOnce(responseRegisterSuccess);
    const { getByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    const registerSuccessElement = await findByText(responseRegisterSuccess.data.createduser);
    expect(axiosMock.post).toHaveBeenCalledTimes(3);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Register error occured', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject(responseRegisterError));
    const { getByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    const nameErrorElement = await findByText(responseRegisterError.response.data.name);
    const emailErrorElement = await findByText(responseRegisterError.response.data.email);
    const passwordErrorElement = await findByText(responseRegisterError.response.data.password);
    const password2ErrorElement = await findByText(responseRegisterError.response.data.password2);
    expect(axiosMock.post).toHaveBeenCalledTimes(4);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Login link is clicked', () => {
    const { getByTestId } = render(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-login'));

    expect(getByTestId('login-button')).toBeInTheDocument();
  });
});

/**
 * FORGOT PASSWORD page
 */
describe('Forgot Password Page', () => {
  it('submit button is present', () => {
    const { getByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-forgotpassword'));

    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();
  });

  it('Forgot Password is successful', async () => {
    axiosMock.post.mockResolvedValueOnce(responseForgotPasswordSuccess);
    const { getByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    const forgotPasswordSuccessElement = await findByText(responseForgotPasswordSuccess.data.emailsent);
    expect(axiosMock.post).toHaveBeenCalledTimes(5);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });

  it('Forgot Password error occured', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject(responseForgotPasswordError));
    const { getByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    const forgotPasswordErrorElement = await findByText(responseForgotPasswordError.response.data.email);
    expect(axiosMock.post).toHaveBeenCalledTimes(6);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });
});

/**
 * DASHBOARD page
 */
describe('Dashboard Page', () => {
  it('dashboard note is present', async () => {
    axiosMock.post.mockResolvedValueOnce(responseLoginSuccess);
    const { getByTestId, findByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-button'));

    const dashboardNoteElement = await findByTestId('dashboard-note');
  });

  it('Welcome note is present', async () => {
    axiosMock.post.mockResolvedValueOnce(responseLoginSuccess);
    const { getByTestId, findByTestId, findByText } = render(<App />);

    fireEvent.click(getByTestId('login-button'));

    const dashboardNoteElement = await findByTestId('dashboard-note');
    const welcomeNoteElement = await findByText(/Welcome to notes/);
  });

  it('help button is clicked', async () => {
    axiosMock.post.mockResolvedValueOnce(responseLoginSuccess);
    const { getByTestId, findByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-button'));
    const dashboardNoteElement = await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-help'));

    const helpNoteElement = await findByText(/This is notes/);
  });

  it('logout button is clicked', async () => {
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseLogoutSuccess);
    const { getByTestId, findByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-button'));
    const dashboardNoteElement = await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-logout'));

    const loginButtonElement = await findByTestId('login-button');
  });

  it('new note button is clicked', async () => {
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseNewNoteSuccess);
    const { getByTestId, findByTestId, findAllByText } = render(<App />);
    fireEvent.click(getByTestId('login-button'));
    const dashboardNoteElement = await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-newnote'));

    const loginButtonElement = await findAllByText(/An awesome new note/);
  });
});
