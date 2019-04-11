import { openS,closeS,searchS} from '../../services/api';

export default {
    // effects: {
    //     *openS({ payload ,callback}, { call, put }) {
    //         const response = yield call(openS, payload);
    //         if (callback) callback(response);
    //     },
    //     *closeS({ payload ,callback}, { call, put }) {
    //         const response = yield call(closeS, payload);
    //         if (callback) callback(response);
    //     },
    //     *searchS({ payload ,callback}, { call, put }) {
    //         const response = yield call(searchS, payload);
    //         if (callback) callback(response);
    //     },
    // },
    namespace: 'service',
    state: [],
    reducers: {
        'delete'(state, { payload: id }) {
            return state.filter(item => item.id !== id);
        },
    },
};