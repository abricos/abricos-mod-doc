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
            (userid, title, descript, dateline) VALUES (
                ".intval(Abricos::$user->id).",
                '".bkstr($r->vars->title)."',
                '".bkstr($r->vars->descript)."',
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
                descript='".bkstr($r->vars->descript)."',
                upddate=".TIMENOW."
            WHERE docid=".intval($r->vars->docid)."
            LIMIT 1
        ";
        $db->query_write($sql);
    }
}
