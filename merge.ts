import Merger from "./src/Merger"

const start = async () => {
    const merger = await Merger.init();
    merger.merge()
}

start();