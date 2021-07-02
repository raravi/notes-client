import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { render, cleanup, fireEvent } from '@testing-library/react';
import ReactTestUtils from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import axiosMock from 'axios';
import jwtDecodeMock from 'jwt-decode';
import App from './App';
import { loginApiDetails, appApiDetails } from './config/apiDetails';
import { loadNoteInEditor } from './editor/Editor';

jest.mock('axios');
jest.mock('jwt-decode');
jest.useFakeTimers('modern');
console.error = jest.fn();

function renderWithRouter(ui) {
  const Wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );
  return {
    ...render(ui, { wrapper: Wrapper })
  };
}

/**
 *   Stubs / Mocks.
 */
let tokenDecodedSuccess = {
      id: '5e5edca43aa9dc587503e1b4',
      name: 'Amith Raravi',
      iat: 1584404174,
      exp: 1615961100
    },
    tokenDecodedError,

    loginURL = loginApiDetails.url + loginApiDetails.endpoints.login,
    loginOptions = {"email": "", "password": ""},
    responseLoginSuccessToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNWVkY2E0M2FhOWRjNTg3NTAzZTFiNCIsIm5hbWUiOiJBbWl0aCBSYXJhdmkiLCJpYXQiOjE1ODQ0MDQxNzQsImV4cCI6MTYxNTk2MTEwMH0.qLqhN_1CHbQLOCXzOyxRZS9K42AsoHtQbF-qL8vgn0o',
    responseLoginSuccess,
    responseLoginEmailError = "Email not found",
    responseLoginPasswordError = "Password incorrect",
    responseLoginError,

    initialSyncURL = appApiDetails.url + appApiDetails.endpoints.initialSync,
    initialSyncOptions = {
      userId: {
        "userid": "5e5edca43aa9dc587503e1b4"
      },
      header: {
        "headers": {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNWVkY2E0M2FhOWRjNTg3NTAzZTFiNCIsIm5hbWUiOiJBbWl0aCBSYXJhdmkiLCJpYXQiOjE1ODQ0MDQxNzQsImV4cCI6MTYxNTk2MTEwMH0.qLqhN_1CHbQLOCXzOyxRZS9K42AsoHtQbF-qL8vgn0o"
        },
        "withCredentials": true
      }
    },
    responseInitialSyncSuccess,
    responseInitialSyncError,

    registerURL = loginApiDetails.url + loginApiDetails.endpoints.register,
    registerOptions = {"name": "", "email": "", "password": "", "password2": ""},
    responseRegisterSuccessCreatedUser = "New user registered successfully!",
    responseRegisterSuccess,
    responseRegisterErrorName = "Name field is required",
    responseRegisterErrorEmail = "Email already exists",
    responseRegisterErrorPassword = "Password must be at least 6 characters",
    responseRegisterErrorPassword2 = "Passwords must match",
    responseRegisterError,

    forgotPasswordURL = loginApiDetails.url + loginApiDetails.endpoints.forgotPassword,
    forgotPasswordOptions = {"email": ""},
    responseForgotPasswordSuccessEmailSent = 'The reset email has been sent, please check your inbox!',
    responseForgotPasswordSuccess,
    responseForgotPasswordErrorEmail = "Email not found",
    responseForgotPasswordError,

    responseLogoutSuccess = {
      data: {
        success: true
      }
    },
    responseLogoutError = {
      response: {
        status: 404,
        data: {}
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
    },
    responseNewNoteError = {
      response: {
        status: 404,
        data: {}
      }
    },
    // responseSyncNoteSuccess,
    note = {
      id: "5e604fa41c9d440000e7fbc2",
      note: "# Note for health\n" +
        "1. *Come up with an interesting topic*: This can be anything.\n" +
        "2. *Research on it*: Something here.\n" +
        "3. *Define an outline*: Come up with a decent outline. Do something.",
      modifieddate: "2020-03-16T00:51:52.006Z"
    },
    noteLong = {
      id: "5e604fa41c9d440000e7fbc3",
      note: "# Note for health Note for health Note for health\n" +
        "1. *Come up with interesting topics*: This can be anything.\n" +
        "2. *Research on it*: Something here.\n" +
        "3. *Define an outline*: Come up with a decent outline. Do something.",
      modifieddate: "2020-02-15T00:51:52.006Z"
    },
    responseSyncNoteNoChanges = {
      data: {
        nochanges: "No changes"
      }
    },
    responseSyncNoteUpdated = {
      data: {
        success: "Note updated!",
        modifieddate: "2020-03-16T00:51:52.006Z"
      }
    },
    responseSyncNoteUpdatedError = {
      data: {
        success: "Note updated!"
      }
    },
    responseSyncNoteModified = {
      data: {
        notemodified: "Note modified by another session",
        note: note.note + "server",
        modifieddate: "2020-03-16T00:51:52.006Z"
      }
    },
    responseSyncNoteError = {
      response: {
        status: 404,
        data: {}
      }
    },
    responseDeleteSuccess = {
      data: {
        success: "Note deleted!"
      }
    },
    responseDeleteError = {
      response: {
        status: 404,
        data: {}
      }
    },
    responseSyncAllSuccess = {
      data: {
        success: true,
        notes: [note, noteLong]
      }
    },
    responseSyncAllSuccessNoteDeleted = {
      data: {
        success: true,
        notes: [noteLong]
      }
    },
    responseSyncAllError = {
      response: {
        status: 404,
        data: {}
      }
    };

beforeEach(() => {
  responseLoginSuccess = {
    data: {
      success: true,
      notes: []
    }
  };
  responseLoginError = {
    response: {
      status: 404,
      data: {
        email: "",//"Email not found",
        password: ""//"Password incorrect"
      }
    }
  };
  responseInitialSyncSuccess = {
    data: {
      success: true,
      notes: []
    }
  };
  responseInitialSyncError = {
    response: {
      status: 404,
      data: {}
    }
  };
  responseRegisterSuccess = {
    data: {
      createduser: ""//"New user registered successfully!"
    }
  };
  responseRegisterError = {
    response: {
      status: 404,
      data: {
        name: "",//"Name field is required",
        email: "",//"Email already exists",
        password: "",//"Password must be at least 6 characters",
        password2: "",//"Passwords must match"
      }
    }
  };
  responseForgotPasswordSuccess = {
    data: {
      emailsent: ""//'The reset email has been sent, please check your inbox!'
    }
  };
  responseForgotPasswordError = {
    response: {
      status: 404,
      data: {
        email: ""//"Email not found"
      }
    }
  };
});

afterEach(() => {
  axiosMock.post.mockReset();
  jwtDecodeMock.mockReset();
});

afterEach(cleanup);

/**
 * LOGIN page
 */
describe('Login Page', () => {
  it.skip('submit button is present', () => {
    const { getByTestId } = renderWithRouter(<App />);

    expect(getByTestId('login-button')).toBeInTheDocument();
  });

  it('login is successful', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByTestId('dashboard-note');
    expect(axiosMock.post).toHaveBeenCalledTimes(2);
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, loginURL, loginOptions);
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, initialSyncURL, initialSyncOptions.userId, initialSyncOptions.header);
  });

  it('login is successful: no token', async () => {
    responseLoginSuccess.data.token = null;
    axiosMock.post.mockResolvedValueOnce(responseLoginSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByTestId('login-button');
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it('login is successful: no tokenDecoded', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post.mockResolvedValueOnce(responseLoginSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedError);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByTestId('login-button');
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it('login error occured: initialsync no response', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess = null;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId } = renderWithRouter(<App />);

    await fireEvent.click(getByTestId('login-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(2);
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, loginURL, loginOptions);
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, initialSyncURL, initialSyncOptions.userId, initialSyncOptions.header);
  });

  it('login error occured: initialsync error', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockRejectedValueOnce(responseInitialSyncError);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId } = renderWithRouter(<App />);

    await fireEvent.click(getByTestId('login-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(2);
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, loginURL, loginOptions);
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, initialSyncURL, initialSyncOptions.userId, initialSyncOptions.header);
  });

  it.skip('login error occured', async () => {
    responseLoginError.response.data.email = responseLoginEmailError;
    responseLoginError.response.data.password = responseLoginPasswordError;
    axiosMock.post.mockImplementation(() => Promise.reject(responseLoginError));
    const { getByTestId, findByText } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByText(responseLoginError.response.data.email);
    await findByText(responseLoginError.response.data.password);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it.skip('login error occured: no parameter', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject(responseLoginError));
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it.skip('login error occured: no response', async () => {
    responseLoginError.response = null;
    axiosMock.post.mockImplementation(() => Promise.reject(responseLoginError));
    const { getByTestId, findByText } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByText("Unable to reach server...");
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it.skip('login error occured: no response.data', async () => {
    responseLoginError.response.data = null;
    axiosMock.post.mockImplementation(() => Promise.reject(responseLoginError));
    const { getByTestId, findByText } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByText("Unable to reach server...");
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(loginURL, loginOptions);
  });

  it.skip('Register link is clicked', () => {
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-register'));

    expect(getByTestId('register-button')).toBeInTheDocument();
  });

  it.skip('Forgot Password is clicked', () => {
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-forgotpassword'));

    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();
  });
});

/**
 * REGISTER page
 */
describe.skip('Register Page', () => {
  it('submit button is present', () => {
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-register'));

    expect(getByTestId('register-button')).toBeInTheDocument();
  });

  it('Register is successful', async () => {
    responseRegisterSuccess.data.createduser = responseRegisterSuccessCreatedUser;
    axiosMock.post.mockResolvedValueOnce(responseRegisterSuccess);
    const { getByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    await findByText(responseRegisterSuccess.data.createduser);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Register is successful: no response.data.createduser', async () => {
    responseRegisterSuccess.data.createduser = null;
    axiosMock.post.mockResolvedValueOnce(responseRegisterSuccess);
    const { getByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Register error occured', async () => {
    responseRegisterError.response.data.name = responseRegisterErrorName;
    responseRegisterError.response.data.email = responseRegisterErrorEmail;
    responseRegisterError.response.data.password = responseRegisterErrorPassword;
    responseRegisterError.response.data.password2 = responseRegisterErrorPassword2;
    axiosMock.post.mockImplementation(() => Promise.reject(responseRegisterError));
    const { getByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    await findByText(responseRegisterError.response.data.name);
    await findByText(responseRegisterError.response.data.email);
    await findByText(responseRegisterError.response.data.password);
    await findByText(responseRegisterError.response.data.password2);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Register error occured: no parameters', async () => {
    axiosMock.post.mockImplementation(() => Promise.reject(responseRegisterError));
    const { getByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Register error occured: no error.response', async () => {
    responseRegisterError.response = null;
    axiosMock.post.mockImplementation(() => Promise.reject(responseRegisterError));
    const { getByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Register error occured: no error.response.data', async () => {
    responseRegisterError.response.data = null;
    axiosMock.post.mockImplementation(() => Promise.reject(responseRegisterError));
    const { getByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(registerURL, registerOptions);
  });

  it('Login link is clicked', () => {
    const { getByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-register'));
    expect(getByTestId('register-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('register-login'));

    expect(getByTestId('login-button')).toBeInTheDocument();
  });
});

/**
 * FORGOT PASSWORD page
 */
describe.skip('Forgot Password Page', () => {
  it('submit button is present', () => {
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-forgotpassword'));

    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();
  });

  it('Forgot Password is successful', async () => {
    responseForgotPasswordSuccess.data.emailsent = responseForgotPasswordSuccessEmailSent;
    axiosMock.post.mockResolvedValueOnce(responseForgotPasswordSuccess);
    const { getByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    await findByText(responseForgotPasswordSuccess.data.emailsent);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });

  it('Forgot Password is successful: no response.data.emailsent', async () => {
    responseForgotPasswordSuccess.data.emailsent = null;
    axiosMock.post.mockResolvedValueOnce(responseForgotPasswordSuccess);
    const { getByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });

  it('Forgot Password error occured', async () => {
    responseForgotPasswordError.response.data.email = responseForgotPasswordErrorEmail;
    axiosMock.post.mockImplementation(() => Promise.reject(responseForgotPasswordError));
    const { getByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    await findByText(responseForgotPasswordError.response.data.email);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });

  it('Forgot Password error occured: no error.response', async () => {
    responseForgotPasswordError.response = null;
    axiosMock.post.mockImplementation(() => Promise.reject(responseForgotPasswordError));
    const { getByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    await findByText("Unable to reach server...");
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });

  it('Forgot Password error occured: no error.response.data', async () => {
    responseForgotPasswordError.response.data = null;
    axiosMock.post.mockImplementation(() => Promise.reject(responseForgotPasswordError));
    const { getByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    await findByText("Unable to reach server...");
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });

  it('Forgot Password error occured: no error.response.data.email', async () => {
    responseForgotPasswordError.response.data.email = null;
    axiosMock.post.mockImplementation(() => Promise.reject(responseForgotPasswordError));
    const { getByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-forgotpassword'));
    expect(getByTestId('forgotpassword-button')).toBeInTheDocument();

    fireEvent.click(getByTestId('forgotpassword-button'));

    await findByText("Unable to reach server...");
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(forgotPasswordURL, forgotPasswordOptions);
  });
});

/**
 * DASHBOARD page
 */
describe('Dashboard Page', () => {
  it('dashboard note is present', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByTestId('dashboard-note');
  });

  it('Welcome note is present', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('login-button'));

    await findByTestId('dashboard-note');
    await findByText(/Welcome to notes/);
  });

  it('note edited', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');
    fireEvent.click(document.querySelector(".sidebar__note"));
    const loadedNoteElement = await findByText(/Come up with an interesting topic/);

    document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      collapse: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      },
    });

    let windowSelection = {
      anchorNode: {},
      anchorOffset: 0,
      focusNode: {},
      focusOffset: 0,
      isCollapsed: true,
      addRange: () => {},
      removeAllRanges: () => {}
    };
    window.getSelection = () => {
      windowSelection.anchorNode = loadedNoteElement;
      windowSelection.focusNode = loadedNoteElement;
      windowSelection.anchorOffset = 1;
      windowSelection.focusOffset = 1;
      windowSelection.isCollapsed = true;
      return windowSelection;
    };

    ReactTestUtils.Simulate.keyDown(getByTestId("dashboard-note"), {key: "A", keyCode: 65, which: 65});
  });

  it('help button is clicked: no note loaded', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-help'));

    await findByText(/This is notes/);
  });

  it('help button is clicked: note loaded', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncNoteNoChanges);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);

    fireEvent.click(getByTestId('dashboard-help'));

    await findByText(/This is notes/);
  });

  it('help button is clicked: note loaded (sync error)', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockImplementation(() => Promise.reject(responseSyncNoteError));
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);

    fireEvent.click(getByTestId('dashboard-help'));

    await findByText(/This is notes/);
  });

  it('help button is clicked: long note loaded', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(noteLong);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncNoteNoChanges);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with interesting topics/);

    fireEvent.click(getByTestId('dashboard-help'));

    await findByText(/This is notes/);
  });

  it('help button is clicked: note loaded and edited', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncNoteUpdated);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);

    loadNoteInEditor(note.note + "random", "true");
    fireEvent.click(getByTestId('dashboard-help'));

    await findByText(/This is notes/);
  });

  it('help button is clicked: note loaded and edited (no modifieddate)', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncNoteUpdatedError);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);

    loadNoteInEditor(note.note + "random", "true");
    fireEvent.click(getByTestId('dashboard-help'));

    await findByText(/This is notes/);
  });

  it('help button is clicked: note loaded and modified', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncNoteModified);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);

    fireEvent.click(getByTestId('dashboard-help'));

    await findByText(/This is notes/);
  });

  it('logout button is clicked: success', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseLogoutSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-logout'));

    await findByTestId('login-button');
  });

  it('logout button is clicked: error', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockImplementation(() => Promise.reject(responseLogoutError));
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-logout'));

    await findByTestId('login-button');
  });

  it('new note button is clicked: success', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseNewNoteSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findAllByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-newnote'));

    await findAllByText(/An awesome new note/);
  });

  it('new note button is clicked: no response', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(null);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-newnote'));
  });

  it('new note button is clicked: error', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockImplementation(() => Promise.reject(responseNewNoteError));
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(getByTestId('dashboard-newnote'));
  });

  it('note button is clicked', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);
    fireEvent.click(document.querySelector(".sidebar__note"));
  });

  it('note button (paragraph) is clicked', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note").firstChild);
    await findByText(/Come up with an interesting topic/);
  });

  it('delete button is clicked: success', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseDeleteSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note-close"));
  });

  it('delete button is clicked: no response', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(null);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note-close"));
  });

  it('delete button is clicked: note loaded', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseDeleteSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);
    fireEvent.click(document.querySelector(".sidebar__note-close"));
  });

  it('delete button is clicked: error', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockImplementation(() => Promise.reject(responseDeleteError));
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    fireEvent.click(document.querySelector(".sidebar__note-close"));
  });

  it('syncAll: success', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncAllSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findAllByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');
    const notesInSidebar = await findAllByTestId("sidebar-note");
    expect(notesInSidebar.length).toBe(1);

    jest.runOnlyPendingTimers();
  });

  it('syncAll: note loaded', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncNoteNoChanges)
      .mockResolvedValueOnce(responseSyncAllSuccess);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');
    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);

    jest.runOnlyPendingTimers();
  });

  it('syncAll: note deleted', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(responseSyncNoteNoChanges)
      .mockResolvedValueOnce(responseSyncAllSuccessNoteDeleted);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId, findByText } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');
    fireEvent.click(document.querySelector(".sidebar__note"));
    await findByText(/Come up with an interesting topic/);

    jest.runOnlyPendingTimers();
  });

  it('syncAll: no response', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockResolvedValueOnce(null);
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    jest.runOnlyPendingTimers();
  });

  it('syncAll: error', async () => {
    responseLoginSuccess.data.token = responseLoginSuccessToken;
    responseInitialSyncSuccess.data.notes.push(note);
    axiosMock.post
      .mockResolvedValueOnce(responseLoginSuccess)
      .mockResolvedValueOnce(responseInitialSyncSuccess)
      .mockImplementation(() => Promise.reject(responseSyncAllError));
    jwtDecodeMock.mockImplementation(() => tokenDecodedSuccess);
    const { getByTestId, findByTestId } = renderWithRouter(<App />);
    fireEvent.click(getByTestId('login-button'));
    await findByTestId('dashboard-note');

    jest.runOnlyPendingTimers();
  });
});
