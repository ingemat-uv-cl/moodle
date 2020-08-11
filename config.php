<?php  // Moodle configuration file

unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'pgsql';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'ec2-34-195-115-225.compute-1.amazonaws.com';
$CFG->dbname    = 'd7tp1jvaseqbsm';
$CFG->dbuser    = 'eadntehcdchjdx';
$CFG->dbpass    = '36d11b124a42e447659026a6bc1845537645945d9316dbc8f3bbd3399752a6d1';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport' => '5432',
  'dbsocket' => '',
);

$CFG->wwwroot   = 'http://moodle-inge-abierta-uv-cl.herokuapp.com';
$CFG->dataroot  = '/tmp';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;

require_once(__DIR__ . '/lib/setup.php');

// There is no php closing tag in this file,
// it is intentional because it prevents trailing whitespace problems!
