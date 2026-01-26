fetch("http://backend:5000/api/home")
  .then(res => res.json())
  .then(data => {
    console.log(data);
  });