Hooks.once("init", () => {
    console.log("New Player Orientation module is initialized...");
})

let userLogon = [];
let count = 0;
const messageContent = `<p>Welcome to Foundry. Please create your character.</p>\n<p>Once you are done you can poke around and see Foundry in all of it's glory.</p>`

async function userPrompt(message, html, context) {
    count += 1;
    const user = context.user;
    const showPrompt = user.getFlag("new-player-orientation", "showPrompt");
    if (user.isGM) {
        console.log("User is GM. Do not show.");
        return;
    }
    console.log("Checking if I should show Prompt...");
    if ( showPrompt && count == 1 ) {
        console.log("New User logged in...");
        console.log("Unset showPrompt flag");
        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: `<p>Looks like you haven't been given the scoop. Want to get to creating a character?</p>\n\n<p>Slecting YES will open two tabs. Please move them around as you wish:</p><ol><li>Character Creation Tool</li><li>Player's Handbook Guide to Creating new Character. Use this guide to help you along the process.</li></ol>`,
            rejectClose: false,
            modal: true
        });
        console.log("Displayed dialog");
        if ( proceed ) {
            const creationpbh = await fromUuid("Compendium.dnd-players-handbook.content.JournalEntry.phbCreatingAChar");
            creationpbh.sheet.render(true);
            HEROMANCER.api.openWizard();
        }
    }
}

function userLogin(user, connected) {
    console.log("User login detected...");
    if (connected && !user.isGM) {
        const userFlags = user.flags;
        if ("new-player-orientation" in user.flags) {
            console.log("The flag is here");
            console.log(userFlags["new-player-orientation"]);
            if ("showPrompt" in userFlags["new-player-orientation"]) return;
        };
        console.log(user);
        user.setFlag("new-player-orientation", "showPrompt", true);
        ChatMessage.create({
        content: messageContent,
        whisper: [user.id]
        });
        console.log("Set showPrompt...");
    }
    console.log(userLogon);
}

async function tourStart(document, options, userId) {
    const user = game.users.get(userId);
    const showPrompt = user.getFlag("new-player-orientation", "showPrompt");
    if ( options.documentName === "Actor" && showPrompt && !user.isGM) {
        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: "Great job on creating a character. Would you like a tour of Foundry?",
            rejectClose: false,
            modal: true
        });
        if ( proceed ) game.tours.get('core.uiOverview').start();
        await user.setFlag("new-player-orientation", "showPrompt", false);
        console.log("Set flag to false.")
    }
}

Hooks.on('userConnected', userLogin);
Hooks.on('renderChatMessageHTML', userPrompt);
Hooks.on('createActor', tourStart);