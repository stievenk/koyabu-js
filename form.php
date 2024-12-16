<?php
if ($_REQUEST['cmd']) {
   $data = $_POST;
   echo json_encode($data); exit;
}
// print_r($_REQUEST);
?>
<form id="form1" onsubmit="return false" data-url="form.php">
   <label>Name</label>
   <input type="text" id="name" name="name">

   <p><button type="button" class="submitBtn" data-cmd="save" id="saveBtn">Save</button><button type="button" data-cmd="delete" class="submitBtn" id="deleteBtn">Delete</button></p>
</form>
<script>
$('.submitBtn').on('click',function(){
   var cmd = $(this).attr('data-cmd');
   postForm({
      url : 'form.php',
      form : '#form1',
      data : { cmd : cmd, 'post' : 'datahere' },
      success : function(js) {
		   alert('OK!!: '+JSON.stringify(js));
	   }
   });
})
</script>