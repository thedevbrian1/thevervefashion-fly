export default function Label({ htmlFor, children }) {
    return (
        <label htmlFor={htmlFor} className="uppercase text-sm">{children}</label>
    );
}