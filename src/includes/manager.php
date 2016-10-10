<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class DocManager
 */
class DocManager extends Ab_ModuleManager {
    public function IsAdminRole(){
        return $this->IsRoleEnable(DocAction::ADMIN);
    }

    public function IsWriteRole(){
        return $this->IsRoleEnable(DocAction::WRITE);
    }

    public function IsViewRole(){
        return $this->IsRoleEnable(DocAction::VIEW);
    }

    public function AJAX($d){
        return $this->GetApp()->AJAX($d);
    }

    public function Bos_MenuData(){
        if (!$this->IsViewRole()){
            return null;
        }
        $i18n = $this->module->I18n();
        return array(
            array(
                "name" => "doc",
                "title" => $i18n->Translate('title'),
                "icon" => "/modules/doc/img/logo-48x48.png",
                "url" => "doc/wspace/ws",
            )
        );
    }

}
