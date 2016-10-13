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

    public static function DocList(Ab_Database $db){
        $sql = "
            SELECT
                d.docid,
                d.title
            FROM ".$db->prefix."doc d
            WHERE d.deldate=0
            ORDER BY d.title
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
            (userid, title, dateline) VALUES (
                ".intval(Abricos::$user->id).",
                '".bkstr($r->vars->title)."',
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
            (docid, parentid, elementType, title, ord) VALUES (
                ".intval($docSave->docid).",
                ".intval($parentid).",
                '".bkstr($r->vars->type)."',
                '".bkstr($r->vars->title)."',
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

    public static function ElList(Ab_Database $db, $docid, $type){
        $sql = "
            SELECT 
                e.docid,
                ei.*
            FROM ".$db->prefix."doc_element e
            INNER JOIN ".$db->prefix."doc_el_".bkstr($type)." ei
                ON ei.elementid=e.elementid
            WHERE e.docid=".intval($docid)."
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

}
