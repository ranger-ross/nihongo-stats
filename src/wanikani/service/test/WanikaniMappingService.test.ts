import { describe, beforeEach, it, expect } from "vitest";

import { RawWanikaniReset } from "../../models/raw/RawWanikaniReset";
import { mapWanikaniReset } from "../WanikaniMappingService";


describe('WanikaniMappingService', () => {

    describe('mapWanikaniReset', () => {

        it('should map resets properly', () => {

            const input: RawWanikaniReset = {
                "id": 234,
                "object": "reset",
                "url": "https://api.wanikani.com/v2/resets/80463006",
                "data_updated_at": "2017-12-20T00:24:47.048380Z",
                "data": {
                    "created_at": "2017-12-20T00:03:56.642838Z",
                    "original_level": 42,
                    "target_level": 8,
                    "confirmed_at": "2017-12-19T23:31:18.077268Z"
                }
            }


            const result = mapWanikaniReset(input);

            expect(result.createdAt.getTime()).toBe(1513728236642);
            expect(result.confirmedAt.getTime()).toBe(1513726278077);
            expect(result.originalLevel).toBe(42);
            expect(result.targetLevel).toBe(8);

        });

    });

});

