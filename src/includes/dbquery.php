<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class DocQuery
 */
class DocQuery {

    public static function DocListSort(Ab_Database $db, $docid, $ord){
        $sql = "
            UPDATE ".$db->prefix."doc
            SET ord=".intval($ord)."
            WHERE docid=".intval($docid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

    public static function DocList(Ab_Database $db){
        $sql = "
            SELECT
                d.docid,
                d.title
            FROM ".$db->prefix."doc d
            WHERE d.deldate=0
            ORDER BY d.ord, d.title
        ";
        return $db->query_read($sql);
    }

    public static function Doc(Ab_Database $db, $docid){
        $sql = "
            SELECT d.*
            FROM ".$db->prefix."doc d
            WHERE d.deldate=0 AND docid=".intval($docid)."
            LIMIT 1
        ";
        return $db->query_first($sql);
    }

    public static function DocAppend(Ab_Database $db, DocSave $r){
        $sql = "
            INSERT INTO ".$db->prefix."doc
            (userid, title, miniTitle, dateline) VALUES (
                ".intval(Abricos::$user->id).",
                '".bkstr($r->vars->title)."',
                '".bkstr($r->vars->miniTitle)."',
                ".TIMENOW."
            )
        ";
        $db->query_write($sql);
        return $db->insert_id();
    }

    public static function DocUpdate(Ab_Database $db, DocSave $r){
        $sql = "
            UPDATE ".$db->prefix."doc
            SET 
                title='".bkstr($r->vars->title)."',
                miniTitle='".bkstr($r->vars->miniTitle)."',
                upddate=".TIMENOW."
            WHERE docid=".intval($r->vars->docid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

    public static function DocRemove(Ab_Database $db, $docid){
        $sql = "
            UPDATE ".$db->prefix."doc
            SET deldate=".TIMENOW."
            WHERE docid=".intval($docid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

    public static function ElementList(Ab_Database $db, $docid){
        $sql = "
            SELECT e.*
            FROM ".$db->prefix."doc_element e
            WHERE e.docid=".intval($docid)."
            ORDER BY e.ord
        ";
        return $db->query_read($sql);
    }

    public static function ElementAppend(Ab_Database $db, DocSave $docSave, $parentid, $ord, DocElementSave $r){
        $sql = "
            INSERT INTO ".$db->prefix."doc_element
            (docid, parentid, elementType, title, isAutoTitle, ord) VALUES (
                ".intval($docSave->docid).",
                ".intval($parentid).",
                '".bkstr($r->vars->type)."',
                '".bkstr($r->vars->title)."',
                ".intval($r->vars->isAutoTitle).",
                ".intval($ord)."
            )
        ";
        $db->query_write($sql);
        return $db->insert_id();
    }

    public static function ElementUpdate(Ab_Database $db, DocSave $docSave, $ord, DocElementSave $r){
        $sql = "
            UPDATE ".$db->prefix."doc_element
            SET 
                title='".bkstr($r->vars->title)."',
                isAutoTitle=".intval($r->vars->isAutoTitle).",
                ord=".intval($ord)."

            WHERE docid=".intval($docSave->docid)."
                AND elementid=".intval($r->vars->elementid)."
        ";
        $db->query_write($sql);
    }

    public static function ElementRemove(Ab_Database $db, $docid, $elementid){
        $sql = "
            DELETE FROM ".$db->prefix."doc_element
            WHERE docid=".intval($docid)." AND elementid=".intval($elementid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

    public static function ElRemove(Ab_Database $db, $elementid, $type){
        $sql = "
            DELETE FROM ".$db->prefix."doc_el_".bkstr($type)."
            WHERE elementid=".intval($elementid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

    public static function ElList(Ab_Database $db, $docid, $type, $elids = null){

        $wha = array();
        if (is_array($elids)){
            for ($i = 0; $i < count($elids); $i++){
                $wha[] = "e.elementid=".intval($elids[$i]);
            }
            if (count($wha) === 0){
                return null;
            }
        }

        $sql = "
            SELECT 
                e.docid,
                ei.*
            FROM ".$db->prefix."doc_element e
            INNER JOIN ".$db->prefix."doc_el_".bkstr($type)." ei
                ON ei.elementid=e.elementid
            WHERE e.docid=".intval($docid)."
        ";

        if (count($wha) > 0){
            $sql .= " AND (".implode(" OR ", $wha).")";
        }

        $sql .= "
            ORDER BY e.ord
        ";

        return $db->query_read($sql);
    }

    public static function ElTextUpdate(Ab_Database $db, DocElementSave $r, $d){
        $sql = "
            INSERT INTO ".$db->prefix."doc_el_text
            (elementid, body) VALUES (
                ".intval($r->elementid).",
                '".bkstr($d->body)."'
            ) 
            ON DUPLICATE KEY UPDATE
                body='".bkstr($d->body)."'
        ";
        $db->query_write($sql);
    }

    public static function ElPageUpdate(Ab_Database $db, DocElementSave $r, $d){
        $sql = "
            INSERT INTO ".$db->prefix."doc_el_page
            (elementid, title) VALUES (
                ".intval($r->elementid).",
                '".bkstr($d->title)."'
            ) 
            ON DUPLICATE KEY UPDATE
                title='".bkstr($d->title)."'
        ";
        $db->query_write($sql);
    }

    public static function ElSectionUpdate(Ab_Database $db, DocElementSave $r, $d){
        $sql = "
            INSERT INTO ".$db->prefix."doc_el_section
            (elementid, title) VALUES (
                ".intval($r->elementid).",
                '".bkstr($d->title)."'
            ) 
            ON DUPLICATE KEY UPDATE
                title='".bkstr($d->title)."'
        ";
        $db->query_write($sql);
    }

    public static function ElRowUpdate(Ab_Database $db, DocElementSave $r, $d){
        $sql = "
            INSERT IGNORE INTO ".$db->prefix."doc_el_row
            (elementid) VALUES (
                ".intval($r->elementid)."
            ) 
        ";
        $db->query_write($sql);
    }

    public static function ElColUpdate(Ab_Database $db, DocElementSave $r, $d){
        $sql = "
            INSERT IGNORE INTO ".$db->prefix."doc_el_col
            (elementid) VALUES (
                ".intval($r->elementid)."
            ) 
        ";
        $db->query_write($sql);
    }

    public static function ElTableUpdate(Ab_Database $db, DocElementSave $r, DocElTableSave $ts){
        $sql = "
            INSERT INTO ".$db->prefix."doc_el_table
            (elementid, rowCount, colCount) VALUES (
                ".intval($r->elementid).",
                ".intval($ts->vars->rowCount).",
                ".intval($ts->vars->colCount)."
            ) 
            ON DUPLICATE KEY UPDATE
                rowCount=".intval($ts->vars->rowCount).",
                colCount=".intval($ts->vars->colCount)."
        ";
        $db->query_write($sql);
    }

    public static function ElTableCellAppend(Ab_Database $db, DocElTableSave $ts, DocElTableCellSave $cs){
        $sql = "
            INSERT INTO ".$db->prefix."doc_el_tableCell
            (elementid, cellType, row, col, body) VALUES (
                ".intval($ts->elementid).",
                '".bkstr($cs->vars->type)."',
                ".intval($cs->vars->row).",
                ".intval($cs->vars->col).",
                '".bkstr($cs->vars->body)."'
            ) 
        ";
        $db->query_write($sql);
        return $db->insert_id();
    }

    public static function ElTableCellUpdate(Ab_Database $db, DocElTableSave $ts, DocElTableCellSave $cs){
        $sql = "
            UPDATE ".$db->prefix."doc_el_tableCell
            SET 
                cellType='".bkstr($cs->vars->type)."',
                row=".intval($cs->vars->row).",
                col=".intval($cs->vars->col).",
                body='".bkstr($cs->vars->body)."'
            WHERE elementid=".intval($ts->elementid)."
                AND cellid=".intval($cs->vars->cellid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

    public static function ElTableCellRemove(Ab_Database $db, $elementid, $cellid){
        $sql = "
            DELETE FROM ".$db->prefix."doc_el_tableCell
            WHERE elementid=".intval($elementid)."
                AND cellid=".intval($cellid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }


    public static function ElTableCellList(Ab_Database $db, $elementid){
        $sql = "
            SELECT *
            FROM ".$db->prefix."doc_el_tableCell
            WHERE elementid=".intval($elementid)."
            ORDER BY row, col
        ";
        return $db->query_read($sql);
    }

    public static function LinkList(Ab_Database $db, DocOwner $owner){
        $sql = "
            SELECT
                l.*,
                e.elementType,
                d.docid,
                d.miniTitle as docTitle
            FROM ".$db->prefix."doc_link l
            INNER JOIN ".$db->prefix."doc_element e ON e.elementid=l.elementid
            INNER JOIN ".$db->prefix."doc d ON d.docid=e.docid AND d.deldate=0 
            WHERE l.ownerModule='".bkstr($owner->module)."'
                AND l.ownerType='".bkstr($owner->type)."'
                AND l.ownerid=".intval($owner->ownerid)."                
            ORDER BY l.ord
        ";
        return $db->query_read($sql);
    }

    public static function LinkAppend(Ab_Database $db, DocOwner $owner, DocLinkSave $r){
        $pathCache = json_encode($r->path);
        $sql = "
            INSERT IGNORE INTO ".$db->prefix."doc_link
            (ownerModule, ownerType, ownerid, elementid, pathCache, ord) VALUES (
                '".bkstr($owner->module)."',
                '".bkstr($owner->type)."',
                ".intval($owner->ownerid).",
                ".intval($r->elementid).",
                '".bkstr($pathCache)."',
                ".intval($r->ord)."
            ) 
        ";
        $db->query_write($sql);
        return $db->insert_id();
    }

    public static function LinkUpdate(Ab_Database $db, DocOwner $owner, DocLinkSave $r){
        $pathCache = json_encode($r->path);
        $sql = "
            UPDATE ".$db->prefix."doc_link
            SET 
                elementid=".intval($r->elementid).",
                pathCache='".bkstr($pathCache)."'
            WHERE ownerModule='".bkstr($owner->module)."'
                AND ownerType='".bkstr($owner->type)."'
                AND ownerid=".intval($owner->ownerid)."
                AND linkid=".intval($r->vars->linkid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

    public static function LinkRemove(Ab_Database $db, DocOwner $owner, $linkid){
        $sql = "
            DELETE FROM ".$db->prefix."doc_link
            WHERE ownerModule='".bkstr($owner->module)."'
                AND ownerType='".bkstr($owner->type)."'
                AND ownerid=".intval($owner->ownerid)."
                AND linkid=".intval($linkid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }

}
