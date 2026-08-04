"use client";

import React, { useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search, Loader2 } from "lucide-react";

export type BulkAction = { label: string; onClick: (selectedIds: string[]) => void; danger?: boolean };

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  bulkActions?: BulkAction[];
  onExportCSV?: () => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data, columns, loading = false, total = 0, page = 1, pageSize = 20,
  onPageChange, searchPlaceholder = "Ara…", onSearch, bulkActions = [],
  onExportCSV, emptyMessage = "Kayıt bulunamadı.",
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState("");

  const selectionColumn: ColumnDef<T, unknown> = {
    id: "select",
    header: ({ table }) => (
      <input type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        style={{ accentColor:"#c8a26b", cursor:"pointer" }} />
    ),
    cell: ({ row }) => (
      <input type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        style={{ accentColor:"#c8a26b", cursor:"pointer" }} />
    ),
    size: 40,
  };

  const allColumns = bulkActions.length > 0 ? [selectionColumn, ...columns] : columns;

  const table = useReactTable({
    data, columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
    getRowId: (row) => row.id,
    enableRowSelection: bulkActions.length > 0,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize),
  });

  const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(val: string) {
    setSearch(val);
    onSearch?.(val);
  }

  const s = {
    wrap: { background:"#0f0f12", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", overflow:"hidden" } as React.CSSProperties,
    toolbar: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", gap:12, flexWrap:"wrap" as "wrap" } as React.CSSProperties,
    search: { display:"flex", alignItems:"center", gap:8, background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 12px", minWidth:220 } as React.CSSProperties,
    input: { background:"transparent", border:"none", outline:"none", color:"#f2f2f3", fontSize:13, width:"100%" } as React.CSSProperties,
    btn: { display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#9b9ba4", cursor:"pointer", fontSize:13, whiteSpace:"nowrap" as "nowrap" } as React.CSSProperties,
    dangerBtn: { display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7, border:"1px solid rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.08)", color:"#f87171", cursor:"pointer", fontSize:13, whiteSpace:"nowrap" as "nowrap" } as React.CSSProperties,
    th: { padding:"11px 14px", textAlign:"left" as "left", fontSize:12, fontWeight:500, color:"#6b6b76", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)", userSelect:"none" as "none" } as React.CSSProperties,
    td: { padding:"11px 14px", fontSize:13, color:"#e2e2e8", borderBottom:"1px solid rgba(255,255,255,0.04)" } as React.CSSProperties,
    pager: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.06)" } as React.CSSProperties,
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" as "wrap" }}>
          {onSearch && (
            <div style={s.search}>
              <Search size={14} color="#6b6b76" />
              <input style={s.input} placeholder={searchPlaceholder} value={search}
                onChange={e => handleSearch(e.target.value)} />
            </div>
          )}
          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:12, color:"#c8a26b", fontWeight:600 }}>{selectedIds.length} seçili</span>
              {bulkActions.map((a, i) => (
                <button key={i}
                  style={a.danger ? s.dangerBtn : s.btn}
                  onClick={() => { a.onClick(selectedIds); setRowSelection({}); }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {onExportCSV && (
            <button style={s.btn} onClick={onExportCSV}>
              <Download size={14} /> CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX:"auto" as "auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => {
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <th key={header.id} style={{ ...s.th, cursor: canSort ? "pointer":"default", width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          sorted === "asc" ? <ChevronUp size={13} color="#c8a26b" /> :
                          sorted === "desc" ? <ChevronDown size={13} color="#c8a26b" /> :
                          <ChevronsUpDown size={13} color="#3a3a45" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={allColumns.length} style={{ ...s.td, textAlign:"center", padding:48 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:"#6b6b76" }}>
                    <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
                    <span>Yükleniyor…</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} style={{ ...s.td, textAlign:"center", padding:56, color:"#6b6b76" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : table.getRowModel().rows.map(row => (
              <tr key={row.id}
                style={{ background: row.getIsSelected() ? "rgba(200,162,107,0.04)" : "transparent", transition:"background .15s" }}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={s.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pager}>
          <span style={{ fontSize:13, color:"#6b6b76" }}>
            {Math.min((page-1)*pageSize+1, total)}–{Math.min(page*pageSize, total)} / {total} kayıt
          </span>
          <div style={{ display:"flex", gap:6 }}>
            <button disabled={page === 1} onClick={() => onPageChange?.(1)}
              style={{ ...s.btn, opacity: page===1 ? .35:1, padding:"5px 10px" }}>«</button>
            <button disabled={page === 1} onClick={() => onPageChange?.(page-1)}
              style={{ ...s.btn, opacity: page===1 ? .35:1, padding:"5px 10px" }}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages-4, page-2)) + i;
              return p <= totalPages ? (
                <button key={p} onClick={() => onPageChange?.(p)}
                  style={{ padding:"5px 11px", borderRadius:7, border: p===page ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
                    background: p===page ? "rgba(200,162,107,0.12)":"transparent",
                    color: p===page ? "#c8a26b":"#9b9ba4", cursor:"pointer", fontSize:13 }}>
                  {p}
                </button>
              ) : null;
            })}
            <button disabled={page === totalPages} onClick={() => onPageChange?.(page+1)}
              style={{ ...s.btn, opacity: page===totalPages ? .35:1, padding:"5px 10px" }}>›</button>
            <button disabled={page === totalPages} onClick={() => onPageChange?.(totalPages)}
              style={{ ...s.btn, opacity: page===totalPages ? .35:1, padding:"5px 10px" }}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}
