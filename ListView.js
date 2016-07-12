import ListView from './list/ListView';
import Sorter from './list/Sorter';
import ColumnResizer from './list/ColumnResizer';

var lv = ListView;
lv.Sorter = Sorter;
lv.ColumnResizer = ColumnResizer;

export default lv;