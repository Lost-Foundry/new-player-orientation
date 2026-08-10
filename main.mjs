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
    if ( showPrompt && count == 1 ) {
        console.log("New User logged in...");
        await user.setFlag("new-player-orientation", "showPrompt", false)
        console.log("Unset showPrompt flag")
        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: "Looks like you haven't been given the scoop. Want to get to creating a character?",
            rejectClose: false,
            modal: true
        });
        console.log("Displayed dialog")
        if ( proceed ) HEROMANCER.api.openWizard();;
        console.log("Tour done")
    }
}

function userLogin(user, connected) {
    console.log("User login detected...")
    if (connected && !user.isGM) {
        const userFlags = user.flags
        if ("new-player-orientation" in user.flags) {
            console.log("The flag is here");
            console.log(userFlags["new-player-orientation"]);
            if ("showPrompt" in userFlags["new-player-orientation"]) return;
        };
        console.log(user)
        user.setFlag("new-player-orientation", "showPrompt", true)
        ChatMessage.create({
        content: messageContent,
        whisper: [user.id]
        });
    }
    console.log(userLogon);
}

Hooks.on('userConnected', userLogin);
Hooks.on('renderChatMessageHTML', userPrompt);