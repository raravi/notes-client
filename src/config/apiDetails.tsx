const loginApiDetails: LoginApiDetails = {
  url: 'https://mtkrd60335.execute-api.eu-central-1.amazonaws.com/dev',
  // url: 'http://localhost:4000/dev',
  endpoints: {
    login: '/api/users/login',
    register: '/api/users/register',
    validate: '/api/users/validate',
    forgotPassword: '/api/users/forgotpassword',
    resetPassword: '/api/users/resetpassword'
  }
};

const appApiDetails: AppApiDetails = {
  url: 'https://mysterious-forest-21747.herokuapp.com',
  // url: 'http://localhost:8000',
  endpoints: {
    initialSync: '/api/users/initialsync',
    sync: '/api/users/sync',
    sendAll: '/api/users/sendall',
    logout: '/api/users/logout',
    newNote: '/api/users/new',
    deleteNote: '/api/users/delete'
  }
};

export { loginApiDetails, appApiDetails };
