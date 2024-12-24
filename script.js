document.addEventListener("DOMContentLoaded", () => {
  const exercises = JSON.parse(localStorage.getItem("exercises")) || [];
  const form = document.getElementById("exerciseForm");
  const agenda = document.getElementById("exerciseAgenda");
  const editIndex = document.getElementById("editIndex");
  const downloadButton = document.getElementById("downloadButton");
  const shareButton = document.getElementById("shareButton");
  const loadButton = document.getElementById("loadButton");
  const uploadFile = document.getElementById("uploadFile");

  const saveExercises = () => localStorage.setItem("exercises", JSON.stringify(exercises));

  const renderAgenda = () => {
    agenda.innerHTML = "";
    if (exercises.length === 0) {
      agenda.innerHTML = "<li>No hay ejercicios programados.</li>";
      return;
    }

    exercises
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((exercise, index) => {
        const li = document.createElement("li");
        li.className = "exercise-card";
        li.innerHTML = `
          <p><strong>${exercise.name}</strong> (${exercise.date})</p>
          <p>${exercise.sets} series x ${exercise.reps} repeticiones | ${exercise.weight} kg</p>
          <button class="btn-small blue" onclick="editExercise(${index})">Editar</button>
          <button class="btn-small red" onclick="deleteExercise(${index})">Eliminar</button>
        `;
        agenda.appendChild(li);
      });
  };

  window.editExercise = (index) => {
    const exercise = exercises[index];
    form.exerciseName.value = exercise.name;
    form.sets.value = exercise.sets;
    form.reps.value = exercise.reps;
    form.weight.value = exercise.weight;
    form.exerciseDate.value = exercise.date;
    editIndex.value = index;
  };

  window.deleteExercise = (index) => {
    exercises.splice(index, 1);
    saveExercises();
    renderAgenda();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newExercise = {
      name: form.exerciseName.value,
      sets: parseInt(form.sets.value),
      reps: parseInt(form.reps.value),
      weight: parseFloat(form.weight.value),
      date: form.exerciseDate.value,
    };

    const index = parseInt(editIndex.value);
    if (index >= 0) {
      exercises[index] = newExercise;
    } else {
      exercises.push(newExercise);
    }

    saveExercises();
    renderAgenda();
    form.reset();
    editIndex.value = -1;
  });

  downloadButton.addEventListener("click", () => {
    const exercisesText = exercises.map(e => `${e.name} - ${e.sets} series x ${e.reps} reps - ${e.weight} kg (${e.date})`).join("\n");
    const blob = new Blob([exercisesText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ejercicios.txt";
    link.click();
  });

  shareButton.addEventListener("click", () => {
    const exercisesText = exercises
      .map(e => `*${e.name}*\n${e.sets} series x ${e.reps} reps | ${e.weight} kg (${e.date})`)
      .join("\n\n");
    const message = `🏋🏻‍♂️ *Mi entrenamiento*\n\n${exercisesText}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });

  loadButton.addEventListener("click", () => uploadFile.click());

  uploadFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const lines = reader.result.split("\n");
        lines.forEach(line => {
          const [name, details] = line.split(" - ");
          const [setsReps, date] = details.split(" (");
          const [sets, reps] = setsReps.split(" x ");
          const weight = details.match(/(\d+(\.\d+)?) kg/)[0].replace(" kg", "");
          exercises.push({
            name: name.trim(),
            sets: parseInt(sets),
            reps: parseInt(reps),
            weight: parseFloat(weight),
            date: date.replace(")", "").trim(),
          });
        });
        saveExercises();
        renderAgenda();
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, selecciona un archivo .txt válido.");
    }
  });

  renderAgenda();
});
