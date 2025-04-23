import React from "react";
import { useParams } from "react-router-dom";

export default function GroupPage() {
  const { id } = useParams();
  return (
    <div>
      <h1>Group Page</h1>
      <p>Group ID: {id}</p>
    </div>
  );
}
