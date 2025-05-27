import React from 'react';

const TableStyle: React.FC = () => (
  <style>{`
    .common-table {
      min-width: 600px;
      border-collapse: separate;
      border-spacing: 0;
      background: var(--table-bg, #fff);
      border-radius: 10px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      font-size: 1.05rem;
    }
    .common-table-th {
      padding: 12px 8px;
      font-weight: 700;
      font-size: 1.08rem;
      color: var(--table-header-color, #333);
      border-bottom: 2px solid var(--table-border, #e0e0e0);
      background: var(--table-header-bg, #f5f7fa);
      height: 48px;
    }
    .common-table-td {
      padding: 10px 8px;
      border-bottom: 1px solid var(--table-border, #f0f0f0);
      color: #fff;
      background: #23272f;
    }
    .common-table-img {
      width: 60px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .common-table-tr {
      background: #fff;
    }
    .common-table-tr.selected-row {
      background: #2a395b !important;
    }
    .common-table-tr.selected-row td {
      background: #2a395b !important;
      color: #fff !important;
    }
  `}</style>
);

export default TableStyle;
