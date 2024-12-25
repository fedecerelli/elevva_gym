document.addEventListener("DOMContentLoaded", () => {
  const exercises = JSON.parse(localStorage.getItem("exercises")) || [];
  const form = document.getElementById("exerciseForm");
  const agenda = document.getElementById("exerciseAgenda");
  const editIndex = document.getElementById("editIndex");
  const downloadButton = document.getElementById("downloadButton");
  const shareButton = document.getElementById("shareButton");
  const uploadFile = document.getElementById("uploadFile");

  const saveExercises = () => localStorage.setItem("exercises", JSON.stringify(exercises));

  const renderAgenda = () => {
    agenda.innerHTML = exercises.length === 0
      ? "<li>No hay ejercicios programados.</li>"
      : exercises
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((exercise, index) => `
            <li>
              <p><strong>${exercise.name}</strong> (${exercise.date})</p>
              <p>${exercise.sets} series x ${exercise.reps} repeticiones | ${exercise.weight} kg</p>
              <div class="exercise-action">
                <button onclick="editExercise(${index})">Editar</button>
                <button onclick="deleteExercise(${index})">Eliminar</button>
              </div>
            </li>
          `).join("");
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
      sets: +form.sets.value,
      reps: +form.reps.value,
      weight: +form.weight.value,
      date: form.exerciseDate.value,
    };
    const index = +editIndex.value;
    index >= 0 ? exercises[index] = newExercise : exercises.push(newExercise);
    saveExercises();
    renderAgenda();
    form.reset();
    editIndex.value = -1;
  });

  downloadButton.addEventListener("click", () => {
    const blob = new Blob([exercises.map(e => `${e.name} - ${e.sets}x${e.reps} - ${e.weight}kg (${e.date})`).join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ejercicios.txt";
    link.click();
  });

  shareButton.addEventListener("click", () => {
    const message = exercises.map(e => `${e.name}: ${e.sets}x${e.reps} | ${e.weight}kg (${e.date})`).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(`🏋 Mi entrenamiento\n\n${message}`)}`, "_blank");
  });

  uploadFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        reader.result.split("\n").forEach(line => {
          const [name, details] = line.split(" - ");
          const [setsReps, date] = details.split(" (");
          const [sets, reps] = setsReps.split("x");
          const weight = details.match(/(\d+(\.\d+)?)kg/)[0].replace("kg", "");
          exercises.push({
            name: name.trim(),
            sets: +sets,
            reps: +reps,
            weight: +weight,
            date: date.replace(")", "").trim(),
          });
        });
        saveExercises();
        renderAgenda();
      };
      reader.readAsText(file);
    }
  });

  renderAgenda();
});