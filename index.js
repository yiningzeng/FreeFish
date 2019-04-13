import React from 'react';
import ReactDOM from 'react-dom';
import dva, { connect } from 'dva';
import { LocaleProvider, Table, message,Upload, Icon,Spin ,Button,Select} from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { openS,closeS,searchS} from './services/api';

moment.locale('zh-cn');

const columns = [{
    title: 'Name',
    dataIndex: 'name',
}, {
    title: 'Age',
    dataIndex: 'age',
}, {
    title: 'Address',
    dataIndex: 'address',
}];

const data = [];
for (let i = 0; i < 46; i++) {
    data.push({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        address: `London, Park Lane no. ${i}`,
    });
}

class FreeFish extends React.Component {
    state = {
        selectedRowKeys: [], // Check here to configure the default column
    };

    onSelectChange = (selectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    componentDidMount() {
        try{
            const tableCon = ReactDOM.findDOMNode(this.refs['table']);
            const table = tableCon.querySelector('table');
            table.setAttribute('id','table-to-xls');
        }
        catch (e) {
            // console.error(e);
        }
        const {dispatch} = this.props;
        message.success(`正在查询服务开启状态...`);
        dispatch({
            type: 'service/searchS',
            payload: 8081,
            callback: (v) => {
                console.log(`${this.state.port}服务开启状态:${v}`);
                if (v === 1) {
                    this.setState({serviceChange: false, serviceStatus: true});
                    this.forceUpdate();
                }
                else {
                    this.setState({serviceChange: false, serviceStatus: false});
                }
                // message.success(JSON.stringify(v));
            },
        });
    }


    render() {
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [{
                key: 'all-data',
                text: 'Select All Data',
                onSelect: () => {
                    this.setState({
                        selectedRowKeys: [...Array(46).keys()], // 0...45
                    });
                },
            }, {
                key: 'odd',
                text: 'Select Odd Row',
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return false;
                        }
                        return true;
                    });
                    this.setState({ selectedRowKeys: newSelectedRowKeys });
                },
            }, {
                key: 'even',
                text: 'Select Even Row',
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return true;
                        }
                        return false;
                    });
                    this.setState({ selectedRowKeys: newSelectedRowKeys });
                },
            }],
            onSelection: this.onSelection,
        };
        return (
            <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
        );
    }
}

// 1. Initialize
const app = dva();
console.log(2);
// 2. Model
// app.model(require('./src/models/service').default);
app.model({
    namespace: 'service',
    state: 0,
    effects: {
        *openS({ payload ,callback}, { call, put }) {
            const response = yield call(openS, payload);
            if (callback) callback(response);
        },
        *closeS({ payload ,callback}, { call, put }) {
            const response = yield call(closeS, payload);
            if (callback) callback(response);
        },
        *searchS({ payload ,callback}, { call, put }) {
            const response = yield call(searchS, payload);
            if (callback) callback(response);
        },
    },
    reducers: {
        add  (count) { return count + 1 },
        minus(count) { return count - 1 },
    },
});
// 3. View
const App = connect(({ service }) => ({
    service
}))(function(props) {

    const { dispatch } = props;
    return (
        <div>
            <FreeFish dispatch={dispatch}/>
        </div>
    );
});

// 4. Router
app.router(() => <App />);

// 5. Start
app.start('#root');



// ReactDOM.render(<App />, document.getElementById('root'));
