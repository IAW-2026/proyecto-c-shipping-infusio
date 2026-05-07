export default function HelpPage() {
    return (
        <div className="w-full px-4 sm:px-6 py-2 lg:px-8 flex justify-center" style={{ height: "calc(100vh - 80px)" }}>
            <div className="w-full max-w-4xl">
                <iframe
                    src="https://webagent.ai/chatbot/embed/5ac63685-72d1-4dc7-9d43-54ea9c6394cd/classic"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    style={{ display: "block", minHeight: "350px" }}
                    className="rounded-lg border border-border shadow-md"
                    title="Chatbot de Soporte"
                />
            </div>
        </div>
    );
}