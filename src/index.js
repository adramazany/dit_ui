import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import Units from "./pages/Units";
import Category from "./pages/Category";
import Part from "./pages/Part";
import Partstore from "./pages/Partstore";
import Party from "./pages/Party";
import Store from "./pages/Store";
import StorePosition from "./pages/StorePosition";
import User from "./pages/User";
import UserLogonAudit from "./pages/UserLogonAudit";

import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import './App.css';

export default function App() {
    return (
        <BrowserRouter>
            <TransitionGroup className="transition-group">
                <CSSTransition timeout={300} classNames="fade" key={document.location.key}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="units" element={<Units />} />
                    <Route path="category" element={<Category />} />
                    <Route path="part" element={<Part />} />
                    <Route path="partstore" element={<Partstore />} />
                    <Route path="party" element={<Party />} />
                    <Route path="store" element={<Store />} />
                    <Route path="storeposition" element={<StorePosition />} />
                    <Route path="user" element={<User />} />
                    <Route path="userlogonaudit" element={<UserLogonAudit />} />
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
                </CSSTransition>
            </TransitionGroup>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);