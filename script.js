const projects = [
    {
        name: "Job Search Agent",
        status: "BUILDING",
        icon: "🤖",
        description:
            "An AI assistant that finds, analyzes and ranks opportunities."
    },

    {
        name: "IT Support Agent",
        status: "NEXT",
        icon: "⚙️",
        description:
            "Exploring how AI can automate everyday IT support workflows."
    },
    {
        name: "SF Visitor",
        status: "PLANNED",
        icon: "🌉",
        description:
            "Helping visitors discover events, transportation and people."
    }
];

console.log(projects);
const projectContainer = document.querySelector("#project-cards");

projects.map(project => {

    const card = document.createElement("article");

    card.classList.add("card");

    card.innerHTML = `
        <div class="card-top">
<span>${project.icon}</span>            <span class="status">${project.status}</span>
        </div>

        <h3>${project.name}</h3>

        <p>${project.description}</p>

        <small>MOOMAF / AI LAB</small>
        <button class="project-button">View Project</button>
    `;
const button = card.querySelector(".project-button");

button.addEventListener("click", () => {
    console.log(`You selected: ${project.name}`);
});
    projectContainer.appendChild(card);
});