import React from 'react';

export default function App() {
  const [message, setMessage] = React.useState<string | null>("Hello from App.tsx");

  return <>
    <p>{message}</p>
  </>;
}
