import React, { useState, useRef, useEffect } from "react";
import Table from "./table/table";
import axios from "axios";
import moment from "moment";

function Main() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState({
    skip: 0,
    size: 10,
    search: "",
  });

  useEffect(() => {
    getData(query);
  }, []);

  useEffect(() => {
    getData(query);
  }, [query]);

  const getData = (query) => {
    axios
      .post(import.meta.env.VITE_BACKEND_URL, {
        ...query,
        searchFilter: query.search,
        page: query.skip / 10,
      })
      .then((res) => res.data)
      .then((res) => {
        setData(res.data);
        setCount(res.count);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const columns = [
    { Header: "Podcast name", accessor: "podcastName" },
    { Header: "Podcast title", accessor: "podcastTitle" },
    { Header: "Topic", accessor: "topic" },
    { Header: "Content", accessor: "content" },
    {
      Header: "Time stamp",
      accessor: "timeStamp",
      Cell: ({ row }) =>
        moment.utc(row.original.timeStamp * 1000).format("HH:mm:ss"),
    },
  ];

  if (loading) return <span>Loading...</span>;
  else {
    if (error !== null) return <span>{error}</span>;
    else
      return (
        <Table
          title="Podcast transcripts"
          columns={columns}
          data={data}
          totalCount={count}
          query={query}
          setQuery={setQuery}
        />
      );
  }
}

export default Main;
