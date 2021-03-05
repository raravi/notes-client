declare module '@bit/raravi.react.login';
declare module 'dompurify';

type LoginApiDetails = {
  url: string,
  endpoints: {
    login: string,
    register: string,
    validate: string,
    forgotPassword: string,
    resetPassword: string
  }
};

type AppApiDetails = {
  url: string,
  endpoints: {
    initialSync: string,
    sync: string,
    sendAll: string,
    logout: string,
    newNote: string,
    deleteNote: string
  }
};

type LoginComponentProps = {
  loginSuccessCallback: (response: any) => void,
  apiDetails: ApiDetails,
};

type Note = {
  id: string,
  note: string,
  modifieddate: string,
};

type User = {
  id: string,
  name: string,
};

type DashboardComponentProps = {
  setUserLoggedIn: Dispatch<SetStateAction<TokenDecoded | null>>,
  setNotes: Dispatch<SetStateAction<Note[]>>,
  notes: Note[],
  user: User,
};