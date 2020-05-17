exports.run = async (client, message, args, level) => {
    moduleToRun = args[0]
    if (!moduleToRun) return false;

    const module = client.modules.find(mod => mod.props.name == moduleToRun)
    if (!module) return false;

    module.run(client, message, args.slice(1), level)
}

exports.conf = {
    enabled: true,
    aliases: ['r'],
    permLevel: "5"
};

exports.help = {
    name: "run",
    category: "Modules",
    description: "",
    usage: "run"
};