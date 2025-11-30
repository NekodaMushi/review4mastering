<button
  onClick={async () => {
    const res = await fetch("/api/notifications/test", {
      method: "POST",
    });
    const data = await res.json();
    console.log(data);
    alert(data.message);
  }}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  📤 Test Notification
</button>;
