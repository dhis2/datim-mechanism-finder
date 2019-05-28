import React from "react";

import ReactTable from "react-table";
import "react-table/react-table.css";

function getData(array){
  var newData = JSON.parse(JSON.stringify(array))
  newData.splice(0,1)
  return newData
}

function getColumns(array){
  console.log(array)
  var columns = array.reduce((columnsArray, column) => {
      columnsArray.push({'Header': column, 'accessor': column});
      return columnsArray
  }, []);
  return columns
}



function DataReactTable(props) {
  return (
    <ReactTable
      data={getData(props.data)}
      columns={getColumns(props.data[0])}
      filterable={true}
      defaultPageSize={5}
    />
  );
}

export default DataReactTable;

/*
import React from "react";
import { render } from "react-dom";
import { makeData, Logo, Tips } from "./Utils";
import matchSorter from 'match-sorter'

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

  render() {
    const { data } = this.state;
    return (
      <div>
        <ReactTable
          data={data}
          filterable
          defaultFilterMethod={(filter, row) =>
            String(row[filter.id]) === filter.value}
          columns={[
            {
              Header: "Name",
              columns: [
                {
                  Header: "First Name",
                  accessor: "firstName",
                  filterMethod: (filter, row) =>
                    row[filter.id].startsWith(filter.value) &&
                    row[filter.id].endsWith(filter.value)
                },
                {
                  Header: "Last Name",
                  id: "lastName",
                  accessor: d => d.lastName,
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["lastName"] }),
                  filterAll: true
                }
              ]
            },
            {
              Header: "Info",
              columns: [
                {
                  Header: "Age",
                  accessor: "age"
                },
                {
                  Header: "Over 21",
                  accessor: "age",
                  id: "over",
                  Cell: ({ value }) => (value >= 21 ? "Yes" : "No"),
                  filterMethod: (filter, row) => {
                    if (filter.value === "all") {
                      return true;
                    }
                    if (filter.value === "true") {
                      return row[filter.id] >= 21;
                    }
                    return row[filter.id] < 21;
                  },
                  Filter: ({ filter, onChange }) =>
                    <select
                      onChange={event => onChange(event.target.value)}
                      style={{ width: "100%" }}
                      value={filter ? filter.value : "all"}
                    >
                      <option value="all">Show All</option>
                      <option value="true">Can Drink</option>
                      <option value="false">Can't Drink</option>
                    </select>
                }
              ]
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <br />
        <Tips />
        <Logo />
      </div>
    );
*/