const loginApiDetails = {
  url: 'https://mtkrd60335.execute-api.eu-central-1.amazonaws.com/dev',
  // url: 'http://localhost:4000/dev',
  endpoints: {
    login: '/api/users/login',
    register: '/api/users/register',
    forgotPassword: '/api/users/forgotpassword',
    resetPassword: '/api/users/resetpassword'
  }
};

const appApiDetails = {
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
