import { createEvent, createStore, restore, sample } from "effector";
import { $db, DrawingHistory } from "../db/model.ts";

class ItemStateModel {
  public readonly set = createEvent<DrawingHistory | null>();
  public readonly setById = createEvent<number>();
  public readonly $state = restore(this.set, null);

  public constructor() {
    sample({
      source: $db,
      clock: this.setById,
      fn: (db, index) => db.histories[index] || null,
      target: this.set,
    });
  }
}

export const itemPreview = new ItemStateModel();
export const selectedItem = new ItemStateModel();
