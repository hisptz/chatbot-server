export interface Action {
    id: number;
    type: string;
}


export interface Tree {
    id: number;
    trigger: string;
    complete: Action;
    initialState: TreeState;
    states: TreeState[];
}

export interface Answer {
    id: number;
    next?: string;
    text: string;
    type: string;
}

export interface TreeState {
    id: number;
    question: string;
    errorResponse: string;
    answers: Answer[];
}
