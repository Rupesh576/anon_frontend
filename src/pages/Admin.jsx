import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const accessMap = {
    "super-key": "absolute",
    "mod-key": "moderator",
    "add-key": "contributor",
};
const url='https://anon-backend-1.onrender.com';
function Admin() {
    const navigate = useNavigate();

    const [secret, setSecret] = useState("");
    const [role, setRole] = useState(null);

    const [badwords, setBadwords] = useState([]);
    const [newWord, setNewWord] = useState("");

    const [messages, setMessages] = useState([]);
    const [banned, setBanned] = useState({ ips: [], fingerprints: [] });

    // 🔐 Prompt logic on first load
    useEffect(() => {
        const storedSecret = localStorage.getItem("adminSecret");
        const storedRole = accessMap[storedSecret];

        if (!storedSecret || !storedRole) {
            // Show prompt AFTER rendering to avoid redirect loop
            setTimeout(() => {
                const input = prompt("Enter admin access key:");
                if (input) {
                    const foundRole = accessMap[input];
                    if (!foundRole) {
                        alert("❌ Invalid key. Access denied.");
                        navigate("/");
                    } else {
                        setSecret(input);
                        setRole(foundRole);
                        localStorage.setItem("adminSecret", input);
                        localStorage.setItem("adminRole", foundRole);
                    }
                } else {
                    navigate("/");
                }
            }, 100);
        } else {
            setSecret(storedSecret);
            setRole(storedRole);
        }
    }, []);

    useEffect(() => {
        if (secret) {
            fetchWords();
            fetchMessages();
            fetchBanned();
        }
    }, [secret]);

    const fetchWords = async () => {
        const res = await axios.get(`${url}/api/badwords`, {
            headers: { "x-admin-secret": secret },
        });
        setBadwords(res.data);
    };

    const addWord = async () => {
        if (!newWord.trim()) return;
        await axios.post(`${url}/api/badwords`, { word: newWord }, {
            headers: { "x-admin-secret": secret },
        });
        setNewWord("");
        fetchWords();
    };

    const deleteWord = async (word) => {
        await axios.delete(`${url}/api/badwords/${word}`, {
            headers: { "x-admin-secret": secret },
        });
        fetchWords();
    };

    const fetchMessages = async () => {
        const res = await axios.get(`${url}/api/messages`, {
            headers: { "x-admin-secret": secret },
        });
        setMessages(res.data);
    };

    const deleteMessage = async (_id) => {
        await axios.delete(`${url}/api/messages/${_id}`, {
            headers: { "x-admin-secret": secret },
        });
        fetchMessages();
    };

    const fetchBanned = async () => {
        const res = await axios.get(`${url}/api/banned`, {
            headers: { "x-admin-secret": secret },
        });
        setBanned(res.data);
    };

    const banUser = async (ip, fingerprint) => {
        await axios.post(`${url}/api/ban`, { ip, fingerprint }, {
            headers: { "x-admin-secret": secret },
        });
        alert("User banned.");
        fetchBanned();
    };

    const unbanUser = async (ip, fingerprint) => {
        await axios.post(`${url}/api/unban`, { ip, fingerprint }, {
            headers: { "x-admin-secret": secret },
        });
        alert("User unbanned.");
        fetchBanned();
    };

    const canAdd = ["absolute", "moderator", "contributor"].includes(role);
    const canDelete = ["absolute", "moderator"].includes(role);
    const canManageIPs = role === "absolute";

    return (
        <div>
            <h2>🛠️ Admin Panel</h2>

            <input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="New bad word"
            />
            {canAdd && <button onClick={addWord}>Add</button>}
            <ul>
                {badwords.map((word, i) => (
                    <li key={i}>
                        {word}
                        {canDelete && (
                            <button onClick={() => deleteWord(word)} style={{ marginLeft: "10px" }}>
                                ❌
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <hr />
            <h3>🧹 Delete Messages</h3>
            <ul>
                {messages.map((msg) => (
                    <li key={msg._id}>
                        {msg.text}
                        {canDelete && (
                            <button onClick={() => deleteMessage(msg._id)} style={{ marginLeft: "10px" }}>
                                ❌
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {canManageIPs && (
                <>
                    <hr />
                    <h3>👀 Users Info + Ban</h3>
                    <ul>
                        {messages.map((msg) => (
                            <li key={msg._id}>
                                <div><strong>{msg.text}</strong></div>
                                <div style={{ fontSize: "12px" }}>
                                    IP: {msg.ip || "N/A"} <br />
                                    Fingerprint: {msg.fingerprint || "N/A"}
                                </div>
                                <button
                                    onClick={() => banUser(msg.ip, msg.fingerprint)}
                                    style={{ marginTop: "4px", marginBottom: "10px" }}
                                >
                                    🚫 Ban User
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <h3>⛔ Blocked Users</h3>

            <h4>📡 Blocked IPs</h4>
            {canManageIPs && (
                <ul>
                    {banned.ips.map((ip, i) => (
                        <li key={i}>
                            {ip}
                            <button onClick={() => unbanUser(ip, null)} style={{ marginLeft: "10px" }}>
                                🔓 Unban
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <h4>🧬 Blocked Fingerprints</h4>
            {canManageIPs && (
                <ul>
                    {banned.fingerprints.map((fp, i) => (
                        <li key={i}>
                            {fp}
                            <button onClick={() => unbanUser(null, fp)} style={{ marginLeft: "10px" }}>
                                🔓 Unban
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Admin;
