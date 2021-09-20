export type Entity = "datetimeV2" | "Room" | "personName" | "BookingTitle";

export type Intent = "BookRoom" | "CheckAvailability" | "None";

export interface QueryResponse {
    query: string,
    prediction: Prediction
}

interface Prediction  {
    topIntent: Intent,
    intents: Record<Intent, IntentScore>
    entities: Record<Entity, any[]>
}

interface IntentScore {
    score: number;
}