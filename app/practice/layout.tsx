import "./practice.css";

export default function PracticeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="practice-root">
            {children}
        </div>
    );
}
