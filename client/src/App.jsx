import {
    useState
} from "react";

import LoginPage
    from "./pages/LoginPage.jsx";

import RegisterPage
    from "./pages/RegisterPage.jsx";

import ChatPage
    from "./pages/ChatPage.jsx";

import {
    isAuthenticated
} from "./utils/auth.js";

import {
    ChatProvider
} from "./context/ChatContext.jsx";


const App = () => {

    const [
        registerMode,
        setRegisterMode
    ] = useState(false);


    if (!isAuthenticated()) {

        if (registerMode) {
            return (
                <RegisterPage
                    onLogin={() =>
                        setRegisterMode(false)
                    }
                />
            );
        }


        return (
            <LoginPage
                onRegister={() =>
                    setRegisterMode(true)
                }
            />
        );
    }


    return (
        <ChatProvider>
            <ChatPage />
        </ChatProvider>
    );
};


export default App;