import { Outlet, Link } from "react-router-dom";
import './Layout.css'
import UserLogonAudit from "./UserLogonAudit";

const Layout = () => {
    return (
        <>
            <header>
                DIT Project
            </header>
            <nav>
                <ul className="menu">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/units">Units</Link></li>
                    <li><Link to="/category">Category</Link></li>
                    <li><Link to="/part">Part</Link></li>
                    <li><Link to="/partstore">Partstore</Link></li>
                    <li><Link to="/party">Party</Link></li>
                    <li><Link to="/store">Store</Link></li>
                    <li><Link to="/storeposition">StorePosition</Link></li>
                    <li><Link to="/user">User</Link></li>
                    <li><Link to="/userlogonaudit">UserLogonAudit</Link></li>
                </ul>
            </nav>

            <Outlet />
        </>
    )
};

export default Layout;