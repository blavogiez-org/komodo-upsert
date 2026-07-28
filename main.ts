// https://komo.do/docs/ecosystem/api
if (!("localStorage" in globalThis)) {
  Object.assign(globalThis, {
    localStorage: { getItem: () => null, setItem: () => {} },
  });
}

const { KomodoClient } = await import("komodo_client");

const endpoint = "https://komodo.priv.blavogiez.fr"
const komodo = KomodoClient(endpoint, {
  type: "api-key",
  params: {
    key: process.env.KOMODO_API_KEY,
    secret: process.env.KOMODO_API_SECRET,
  },
});

const repository = process.env.CALLER_REPO; 
const composePath = process.env.COMPOSE_PATH;
const headCommit = process.env.HEAD_COMMIT;
const stackName = repository.replace("/", "--");
const server = process.env.KOMODO_SERVER;
const action = process.env.KOMODO_ACTION;
const stack = await komodo.getStack(stackName);

if(action == "deploy") {
    if (!stack) {
        await komodo.createStack({
            name: stackName,
            config: {
            server: server,
            repo: repository,
            commit: headCommit,
            file_paths: [composePath]
            },
        });
    } else {
        await komodo.updateStack(stack.id, {
            server: server,
            repo: repository,
            commit: headCommit,
            file_paths: [composePath]
        });
    }

    await komodo.execute("DeployStack", {
    stack: stackName,
    });
} else if (action == "destroy") {
    await komodo.deleteStack(stack.id);
}
