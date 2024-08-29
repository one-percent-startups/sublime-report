import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from "react-table";
import { SortIcon, SortUpIcon, SortDownIcon } from "../assets/icons/sorting";
import { useAsyncDebounce } from "../hooks/use_debounce";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import "./table.css";

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <label className="flex items-baseline gap-x-2">
      <span className="text-gray-700">{render("Header")}: </span>
      <select
        className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">All</option>
        {options?.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function GlobalFilter({ searchQuery, setSearchQuery }) {
  const [val, setVal] = useState(searchQuery);
  const onFilterChange = useAsyncDebounce((value) => {
    setSearchQuery(val || "");
  }, 200);
  return (
    <div className=" flex mt-2 w-full gap-2 items-center justify-start ">
      <div className="flex items-center float-right lg:w-[30%] sm:w-6/12 border rounded-md px-2 border-gray-300 ">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          className="border-none flex-1 outline-none focus:outline-none focus:border-none bg-transparent w-40 focus:ring-0 focus:ring-opacity-50 sm:w-60 md:w-80 lg:w-96 xl:w-96 2xl:w-96"
          value={val || ""}
          onChange={(e) => {
            setVal(e.target.value);
            onFilterChange(e.target.value);
          }}
          placeholder={`Search`}
        />
      </div>
    </div>
  );
}

// const GlobalFilter = ({ searchQuery, setSearchQuery }) => {
//     return (
//         <div className=" flex mt-2 w-full gap-2 items-center justify-start ">
//             <div className="flex items-center float-right lg:w-[30%] sm:w-6/12 border rounded-md px-2 border-gray-300 ">
//                 <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
//                 <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search..."
//                     className="border-none flex-1 outline-none focus:outline-none focus:border-none bg-transparent w-40 focus:ring-0 focus:ring-opacity-50 sm:w-60 md:w-80 lg:w-96 xl:w-96 2xl:w-96"
//                 />
//             </div>
//         </div>
//     );
// };

// const SearchFilter = ({ data, setFilteredData }) => {
//     const [searchQuery, setSearchQuery] = useState("");

//     useEffect(() => {
//         // Function to filter data based on search query
//         const filterData = () => {
//             if (!searchQuery) {
//                 setFilteredData(data);
//                 return;
//             }

//             const lowercasedQuery = searchQuery.toLowerCase();
//             const filtered = data.filter(item =>
//                 Object.values(item).some(val =>
//                     val.toString().toLowerCase().includes(lowercasedQuery)
//                 )
//             );

//             setFilteredData(filtered);
//         };

//         filterData();
//     }, [searchQuery, data, setFilteredData]);

//     console.log(searchQuery)
//     return (
//         <div className="search-filter">
//             <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search..."
//                 className="border p-2 rounded"
//             />
//         </div>
//     );
// };

const SearchFilter = ({ data, setFilteredData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  // setFilteredData
  useEffect(() => {
    const filterData = (query) => {
      if (!query) {
        setFilteredData(data);
        return;
      }

      const lowercasedQuery = query.toLowerCase();
      const filtered = data.filter((item) =>
        Object.values(item).some(
          (val) =>
            val !== null &&
            val.toString().toLowerCase().includes(lowercasedQuery)
        )
      );
      setFilteredData(filtered);
    };

    filterData(searchQuery);
  }, [searchQuery, data, setFilteredData]);

  return (
    // <div className="flex mt-2 w-full gap-2 items-center justify-start">
    <div className="flex items-center float-right lg:w-[30%] sm:w-6/12 border rounded-md px-2 border-gray-300 ">
      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="border-none flex-1 outline-none focus:outline-none focus:border-none bg-transparent w-40 focus:ring-0 focus:ring-opacity-50 sm:w-60 md:w-80 lg:w-96 xl:w-96 2xl:w-96"
      />
    </div>
    // </div>
  );
};

// eslint-disable-next-line react/prop-types
function Table({
  columns,
  data,
  filterOptions,
  btnText,
  title,
  subtitle,
  bigFilterArea,
  btnfunc,
  query,
  totalCount,
  setQuery,
  paginationQuery,
  setFilter,
  filter,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data);
  // const [filter, setFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    state,
    pageOptions,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    preGlobalFilteredRows,
    setGlobalFilter,
    setPageSize,
  } = useTable(
    {
      columns,
      data: query ? data : filteredData,
      initialState: { pageIndex: 0, pageSize: 10 },
      // initialState: { pageIndex: 1 },
    },
    useFilters, // useFilters!
    useGlobalFilter,
    useSortBy,
    usePagination // new
  );
  paginationQuery;
  const [pageNumbers, setPageNumbers] = useState([]);

  const pageArray = pageOptions;

  // Render the UI for your table

  const [isMobiled, setIsMobile] = useState(false);
  const isMobile = true;
  useEffect(() => {
    setCurrentPage(state.pageIndex + 1);
  }, [state.pageIndex]);

  useEffect(() => {
    const numbers = [];
    for (let i = 1; i <= pageCount; i++) {
      numbers.push(i);
    }
    setPageNumbers(numbers);
  }, [pageCount]);

  useEffect(() => {
    setPageSize(state.pageSize);
  }, [state.pageSize]);

  // backend New Pagiantion
  const handlePageChange = (number) => {
    setQuery((prev) => ({
      ...prev,
      skip: size * (number - 1),
    }));
    setCurrentPage(number);
  };

  //   end

  const pageSize = state.pageSize;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // New pagination
  const pageButtonCount = 3;

  // Calculate the range of page numbers to show
  const startPage = Math.max(1, currentPage - Math.floor(pageButtonCount / 2));
  const endPage = Math.min(pageCount, startPage + pageButtonCount - 1);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // End
  // Dyanmic New Pagination
  const PAGE_COUNT = 3; // Number of pages to show initially

  const getVisiblePages = (currentPage, totalPages) => {
    const visiblePages = [];

    if (totalPages <= PAGE_COUNT) {
      // If total pages are less than or equal to the visible count, show all
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Show first few pages and adjust based on current page
      if (currentPage <= Math.ceil(PAGE_COUNT / 2)) {
        // Show initial pages
        for (let i = 1; i <= PAGE_COUNT; i++) {
          visiblePages.push(i);
        }
      } else if (currentPage >= totalPages - Math.floor(PAGE_COUNT / 2)) {
        // Show last pages
        for (let i = totalPages - PAGE_COUNT + 1; i <= totalPages; i++) {
          visiblePages.push(i);
        }
      } else {
        // Show centered pages
        for (
          let i = currentPage - Math.floor(PAGE_COUNT / 2);
          i <= currentPage + Math.floor(PAGE_COUNT / 2);
          i++
        ) {
          visiblePages.push(i);
        }
      }
    }

    return visiblePages;
  };
  // end
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth >= 710);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="text-left   overflow-hidden">
      {/* SEARCH UI */}
      <div className="px-4 py-4 w-full  flex items-center justify-between">
        <div className="flex w-full items-center flex-row gap-2">
          <div className="">
            <h1 className=" flex item text-2xl font-medium text-gray-900">
              {title}
            </h1>
            <p>{subtitle}</p>
          </div>
        </div>
        <div>
          {btnText && (
            <button
              className="btn btn-primary mr-1 mb-2"
              type="button"
              onClick={btnfunc}
              style={{ whiteSpace: "nowrap" }}
            >
              {btnText}
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-md border">
        <div className="flex flex-col px-4 items-center justify-between my-4">
          <div className="flex mt-2 w-full gap-2 items-center justify-start">
            {/* <div className="flex flex-col px-4 items-center justify-between my-4"> */}
            {query ? (
              <>
                <GlobalFilter
                  searchQuery={query?.search || ""}
                  setSearchQuery={(value) => {
                    setQuery((prev) => ({
                      ...prev,
                      search: value,
                    }));
                  }}
                />
                <div>
                  {/* <div className="filter-container">
								<button
									className="filter-icon"
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								>
									<FaFilter size={20} />
								</button>
								{isDropdownOpen && (
									<ul className="filter-dropdown">
										<li
											className={`filter-item ${filter === 'comingSoon' ? 'active' : ''}`}
											onClick={() => {
												setFilter('comingSoon');
												setIsDropdownOpen(false); // Close dropdown on selection
											}}
										>
											Coming Soon
										</li>
										<li
											className={`filter-item ${filter === 'nowShowing' ? 'active' : ''}`}
											onClick={() => {
												setFilter('nowShowing');
												setIsDropdownOpen(false); // Close dropdown on selection
											}}
										>
											Now Showing
										</li>
										<li
											className={`filter-item ${filter === '' ? 'active' : ''}`}
											onClick={() => {
												setFilter('');
												setIsDropdownOpen(false); // Close dropdown on selection
											}}
										>
											Show All
										</li>
									</ul>
								)}
							</div> */}
                </div>
              </>
            ) : (
              <SearchFilter data={data} setFilteredData={setFilteredData} />
            )}

            {/* </div> */}
            {/* <div className="w-full mt-2">{bigFilterArea}</div>
					{headerGroups?.map((headerGroup) =>
						headerGroup.headers?.map((column) =>
							column.Filter ? (
								<div
									className="mt-2 sm:mt-0"
									key={column.title}
								>
									{column.render("Filter")}
								</div>
							) : null,
						),
					)} */}
          </div>
        </div>
        {/* Tabs UI Start */}

        {/* Tabs UI ENd */}
        {/* TABLE UI */}
        <div className="mt-2 flex flex-col">
          <div className="-my-2 overflow-x-auto  sm:-mx-6 lg:-mx-8">
            <div className=" align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div
                className={`shadow overflow-hidden border-b border-gray-200 `}
              >
                <table
                  {...getTableProps()}
                  className="min-w-full divide-y divide-gray-200"
                >
                  <thead>
                    {headerGroups?.map((headerGroup) => (
                      <tr
                        key={headerGroup}
                        {...headerGroup.getHeaderGroupProps()}
                      >
                        {headerGroup.headers?.map((column, columnIndex) => {
                          if (
                            isMobile ||
                            columnIndex === 0 ||
                            columnIndex === headerGroup.headers.length - 1
                          ) {
                            return (
                              <th
                                key={column}
                                scope="col"
                                className={`group px-6 py-3 border border-white bg-gray-200 text-left text-xs font-medium text-black uppercase tracking-wider `}
                                {...column.getHeaderProps(
                                  column.getSortByToggleProps()
                                )}
                              >
                                <div className="flex items-center justify-between ">
                                  {column.render("Header")}
                                  <span>
                                    {column.isSorted ? (
                                      column.isSortedDesc ? (
                                        <SortDownIcon className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <SortUpIcon className="w-4 h-4 text-gray-400" />
                                      )
                                    ) : (
                                      <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                    )}
                                  </span>
                                </div>
                              </th>
                            );
                          }
                          return null;
                        })}
                      </tr>
                    ))}
                  </thead>
                  {query ? (
                    <tbody
                      {...getTableBodyProps()}
                      className="divide-y divide-gray-200"
                    >
                      {data.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="text-center py-4"
                          >
                            No Data
                          </td>
                        </tr>
                      ) : (
                        page?.map((row) => {
                          prepareRow(row);
                          return (
                            <tr
                              key={row}
                              {...row.getRowProps()}
                              className="bg-white"
                            >
                              {row.cells?.map((cell, cellIndex) => {
                                if (
                                  isMobile ||
                                  cellIndex === 0 ||
                                  cellIndex === row.cells.length - 1
                                ) {
                                  return (
                                    <td
                                      key={cell}
                                      {...cell.getCellProps()}
                                      className="px-6 py-4  border border-white text-sm text-black"
                                      role="cell"
                                    >
                                      {cell.column.Cell.name ===
                                      "defaultRenderer" ? (
                                        <div className="text-sm text-black">
                                          {cell.render("Cell")}
                                        </div>
                                      ) : (
                                        cell.render("Cell")
                                      )}
                                    </td>
                                  );
                                }
                                return null;
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  ) : (
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="text-center py-4"
                          >
                            No Data
                          </td>
                        </tr>
                      ) : (
                        page.map((row, index) => {
                          prepareRow(row);
                          return (
                            <tr key={index}>
                              {row.cells.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  {...cell.getCellProps()}
                                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                >
                                  {cell.render("Cell")}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
        <br />
        {/* Pagination */}

        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalCount}</span> results
              </p>
            </div>

            {query ? (
              <div className="px-4 flex justify-end gap-2 flex-1 w-0">
                <button
                  // className="btn btn-secondary w-24 mr-1 mb-2"
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                  onClick={() => {
                    if (Number(currentPage) - 1 >= 1) {
                      setQuery((prev) => ({
                        ...prev,
                        skip: prev.size * (Number(currentPage) - 2),
                      }));
                      setCurrentPage(Number(currentPage) - 1);
                    }
                  }}
                  disabled={Number(currentPage) === 1}
                >
                  {/* Previous */}
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {getVisiblePages(
                  Number(currentPage),
                  Math.ceil(totalCount / 10)
                ).map((page) => (
                  <button
                    key={page}
                    // className={`btn-page ${Number(currentPage) === page ? 'active' : ''}`}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-gray-500 border-gray-300"
                    }`}
                    onClick={() => {
                      setQuery((prev) => ({
                        ...prev,
                        skip: prev.size * (page - 1),
                      }));
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  // className="btn btn-secondary w-24 mr-1 mb-2"
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                  onClick={() => {
                    if (Number(currentPage) + 1 <= Math.ceil(totalCount / 10)) {
                      setQuery((prev) => ({
                        ...prev,
                        skip: prev.size * Number(currentPage),
                      }));
                      setCurrentPage(Number(currentPage) + 1);
                    }
                  }}
                  disabled={Number(currentPage) === Math.ceil(totalCount / 10)}
                >
                  {/* Next */}
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                  >
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => gotoPage(0)}
                        className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white text-gray-500 border-gray-300"
                      >
                        1
                      </button>
                      {startPage > 2 && (
                        <span className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white text-gray-500 border-gray-300">
                          ...
                        </span>
                      )}
                    </>
                  )}
                  {pages.map((number) => (
                    <button
                      key={number}
                      onClick={() => gotoPage(number - 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === number
                          ? "bg-indigo-500 text-white"
                          : "bg-white text-gray-500 border-gray-300"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  {endPage < pageCount && (
                    <>
                      {endPage < pageCount - 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white text-gray-500 border-gray-300">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => gotoPage(pageCount - 1)}
                        className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white text-gray-500 border-gray-300"
                      >
                        {pageCount}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => nextPage()}
                    disabled={!canNextPage}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                  >
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
