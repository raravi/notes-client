const loginApiDetails = {
  url: 'https://mtkrd60335.execute-api.eu-central-1.amazonaws.com/dev',
  endpoints: {
    login: '/api/users/login',
    register: '/api/users/register',
    forgotPassword: '/api/users/forgotpassword'
  }
};

const appApiDetails = {
  url: 'https://mysterious-forest-21747.herokuapp.com',
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
