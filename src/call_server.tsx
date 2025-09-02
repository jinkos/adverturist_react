// api.tsx
export type EchoRequest = {
    session_id: string | null; // sid_... from your server cookie
    text: string;    // the text your server returns
};

export type EchoResponse = {
    text: string
    session_id: string
    new_session: boolean
    received_at: number
}

const api = import.meta.env.VITE_API_BASE;

// Set this via env (e.g., NEXT_PUBLIC_API_BASE) or pass it in.
const API_BASE = api + "/echo";

// Keep sessionId across calls and persist in cookie
let sessionId: string | null = null;

// Helper to get cookie value
function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Helper to set cookie value
function setCookie(name: string, value: string) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

// Load sessionId from cookie on module load
sessionId = getCookie('adventurist_sessionid');

export async function sendText(text: string): Promise<EchoRequest> {
    // Build request body
    const body: EchoRequest = {
        session_id: sessionId || null,
        text: text,
    };

    console.log("body", body, API_BASE, window.location.origin);

    const response = await fetch(API_BASE, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(sessionId ? { "X-Session-Id": sessionId } : {}), // also pass in header
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Update stored sessionId from response and save to cookie
    if (data.session_id) {
        sessionId = data.session_id;
        if (sessionId) setCookie('adventurist_sessionid', sessionId);
    } else {
        const headerSid = response.headers.get("X-Session-Id");
        if (headerSid) {
            sessionId = headerSid;
            if (sessionId) setCookie('adventurist_sessionid', sessionId);
        }
    }

    return data; // contains { text, session_id, new_session, received_at }
}
