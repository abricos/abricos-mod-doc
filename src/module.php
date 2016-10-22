<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class DocModule
 */
class DocModule extends Ab_Module {

    public function __construct(){
        $this->version = "0.1.2";
        $this->name = "doc";
        $this->takelink = "doc";
        $this->permission = new DocPermission($this);
    }

    public function GetContentName(){
        $adr = Abricos::$adress;
        if ($adr->level >= 2){
            if ($adr->dir[1] === 'imageUpload'){
                return 'imageUpload';
            }
            return 'docViewer';
        }

        return 'index';
    }

    public function Sitemap_IsMenuBuild(){
        return true;
    }

    public function Bos_IsMenu(){
        return true;
    }
}


class DocAction {
    const VIEW = 10;
    const WRITE = 30;
    const ADMIN = 50;
}

class DocPermission extends Ab_UserPermission {

    public function __construct(DocModule $module){
        $defRoles = array(
            new Ab_UserRole(DocAction::VIEW, Ab_UserGroup::GUEST),
            new Ab_UserRole(DocAction::VIEW, Ab_UserGroup::REGISTERED),
            new Ab_UserRole(DocAction::VIEW, Ab_UserGroup::ADMIN),

            new Ab_UserRole(DocAction::WRITE, Ab_UserGroup::ADMIN),

            new Ab_UserRole(DocAction::ADMIN, Ab_UserGroup::ADMIN),
        );
        parent::__construct($module, $defRoles);
    }

    public function GetRoles(){
        return array(
            DocAction::VIEW => $this->CheckAction(DocAction::VIEW),
            DocAction::WRITE => $this->CheckAction(DocAction::WRITE),
            DocAction::ADMIN => $this->CheckAction(DocAction::ADMIN)
        );
    }
}

Abricos::ModuleRegister(new DocModule());
