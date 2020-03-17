import React from 'react';
import { act, render, cleanup, fireEvent, waitForElement } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axiosMock from 'axios';
import App from './App';

jest.mock('axios');

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
    axiosMock.post.mockResolvedValueOnce({
      data: {
        success: true,
        token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNWVkY2E0M2FhOWRjNTg3NTAzZTFiNCIsIm5hbWUiOiJBbWl0aCBSYXJhdmkiLCJpYXQiOjE1ODQ0MDQxNzQsImV4cCI6MTYxNTk2MTEwMH0.qLqhN_1CHbQLOCXzOyxRZS9K42AsoHtQbF-qL8vgn0o',
        notes: []
      }
    });
    const { getByTestId, findByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-button'));

    const dashboardNoteElement = await findByTestId('dashboard-note');
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith("http://localhost:8000/api/users/login", {"email": "", "password": ""});
  });

  it('login error occured', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject({
      response: {
        status: 404,
        data: {
          email: "Email not found",
          password: "Password incorrect"
        }
      }
    }));
    const { getByTestId, findByText, findByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-button'));

    const emailErrorElement = await findByText('Email not found');
    const passwordErrorElement = await findByText('Password incorrect');
    expect(axiosMock.post).toHaveBeenCalledTimes(2);
    expect(axiosMock.post).toHaveBeenCalledWith("http://localhost:8000/api/users/login", {"email": "", "password": ""});
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
    axiosMock.post.mockResolvedValueOnce({
      data: {createduser: "New user registered successfully!"}
    });
    const { getByTestId, findByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    const registerSuccessElement = await findByText('New user registered successfully!');
    expect(axiosMock.post).toHaveBeenCalledTimes(3);
    expect(axiosMock.post).toHaveBeenCalledWith("http://localhost:8000/api/users/register", {"name": "", "email": "", "password": "", "password2": ""});
  });

  it('Register error occured', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject({
      response: {
        status: 404,
        data: {
          name: "Name field is required",
          email: "Email already exists",
          password: "Password must be at least 6 characters",
          password2: "Passwords must match"
        }
      }
    }));
    const { getByTestId, findByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    const nameErrorElement = await findByText('Name field is required');
    const emailErrorElement = await findByText('Email already exists');
    const passwordErrorElement = await findByText('Password must be at least 6 characters');
    const password2ErrorElement = await findByText('Passwords must match');
    expect(axiosMock.post).toHaveBeenCalledTimes(4);
    expect(axiosMock.post).toHaveBeenCalledWith("http://localhost:8000/api/users/register", {"name": "", "email": "", "password": "", "password2": ""});
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
    axiosMock.post.mockResolvedValueOnce({
      data: {emailsent: 'The reset email has been sent, please check your inbox!'}
    });
    const { getByTestId, findByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    const forgotPasswordSuccessElement = await findByText('The reset email has been sent, please check your inbox!');
    expect(axiosMock.post).toHaveBeenCalledTimes(5);
    expect(axiosMock.post).toHaveBeenCalledWith("http://localhost:8000/api/users/forgotpassword", {"email": ""});
  });

  it('Forgot Password error occured', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject({
      response: {
        status: 404,
        data: { email: "Email not found" }
      }
    }));
    const { getByTestId, findByTestId, findByText } = render(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    const forgotPasswordErrorElement = await findByText('Email not found');
    expect(axiosMock.post).toHaveBeenCalledTimes(6);
    expect(axiosMock.post).toHaveBeenCalledWith("http://localhost:8000/api/users/forgotpassword", {"email": ""});
  });
});

/**
 * DASHBOARD page
 */
describe('Dashboard Page', () => {
  it('dashboard note is present', async () => {
    axiosMock.post.mockResolvedValueOnce({
      data: {
        success: true,
        token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNWVkY2E0M2FhOWRjNTg3NTAzZTFiNCIsIm5hbWUiOiJBbWl0aCBSYXJhdmkiLCJpYXQiOjE1ODQ0MDQxNzQsImV4cCI6MTYxNTk2MTEwMH0.qLqhN_1CHbQLOCXzOyxRZS9K42AsoHtQbF-qL8vgn0o',
        notes: []
      }
    });
    const { getByTestId, findByTestId } = render(<App />);

    fireEvent.click(getByTestId('login-button'));

    const dashboardNoteElement = await findByTestId('dashboard-note');
  });
});
